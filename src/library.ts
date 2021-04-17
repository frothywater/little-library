import Database from "./database"
import {
    BookInfo,
    BookRow,
    BookSearchParams,
    BorrowResult,
    LibraryOptions,
    ManagerRow,
    PrimitiveData,
} from "./typing"

const defaultOptions: LibraryOptions = { borrowDuration: 60 }

export default class Library {
    private readonly db: Database
    options: LibraryOptions

    constructor(db: Database, options: LibraryOptions = defaultOptions) {
        this.db = db
        this.options = options
    }

    /* MARK: - Query functions */

    async checkManager(name: string, password: string): Promise<boolean> {
        const managers = await this.db.query<ManagerRow>(
            "select * from manager where name = ? and password = ?",
            [name, password]
        )
        return managers.length == 1
    }

    async addBooks(books: BookInfo[]): Promise<void> {
        await this.db.query("insert into book values ?", [
            books.map(this.convertBookInfo),
        ])
    }

    async searchBook(
        params: BookSearchParams,
        sortingKey: keyof BookRow = "title",
        ascending = true
    ): Promise<BookRow[]> {
        const [conditionString, values] = this.getSearchCondition(params)
        const sqlString = `select * from book
             ${conditionString}
             order by ${sortingKey} ${ascending ? "ASC" : "DESC"}`
        return await this.db.query<BookRow>(sqlString, values)
    }

    async getBorrowedBooks(card_id: number): Promise<BookRow[]> {
        const sqlString = `select * from book where id in 
        (select book_id from borrow where card_id = ?)`
        return await this.db.query<BookRow>(sqlString, [card_id])
    }

    async borrowBook(
        card_id: number,
        book_id: number,
        manager_id: number
    ): Promise<BorrowResult> {
        const stock = await this.getStock(book_id)
        const borrowed = await this.getBorrowStatus(card_id, book_id)
        if (stock > 0 && !borrowed) {
            const borrowDate = new Date()
            const dueDate = new Date()
            dueDate.setDate(borrowDate.getDate() + this.options.borrowDuration)

            await this.db.transaction(async () => {
                await this.db.query(
                    "update book set stock = stock - 1 where id = ?",
                    [book_id]
                )
                await this.db.query("insert into borrow values ?", [
                    [[book_id, card_id, borrowDate, dueDate, manager_id]],
                ])
            })

            return { success: true }
        } else {
            return {
                success: false,
                estimatedAvailableDate: await this.getMinDueDate(book_id),
            }
        }
    }

    async returnBook(card_id: number, book_id: number): Promise<boolean> {
        const borrowed = await this.getBorrowStatus(card_id, book_id)
        if (!borrowed) return false

        await this.db.transaction(async () => {
            await this.db.query(
                "update book set stock = stock + 1 where id = ?",
                [book_id]
            )
            await this.db.query(
                "delete from borrow where book_id = ? and card_id = ?",
                [book_id, card_id]
            )
        })
        return true
    }

    /* MARK: - Helper functions */

    private async getStock(book_id: number): Promise<number> {
        const result = await this.db.query<{ stock: number }>(
            "select stock from book where id = ?",
            [book_id]
        )
        return result[0].stock
    }

    private async getBorrowStatus(
        card_id: number,
        book_id: number
    ): Promise<boolean> {
        const result = await this.db.query<{ count: number }>(
            "select count(*) as count from borrow where card_id = ? and book_id = ?",
            [card_id, book_id]
        )
        return result[0].count > 0
    }

    private async getMinDueDate(book_id: number): Promise<Date> {
        const result = await this.db.query<{ date: Date }>(
            "select min(due_date) as date from borrow where book_id = ?",
            [book_id]
        )
        return result[0].date
    }

    private convertBookInfo(book: BookInfo): PrimitiveData[] {
        const { title, author, press, category, year, price, count } = book
        return [null, title, author, press, category, year, price, count, count]
    }

    private getSearchCondition(
        params: BookSearchParams
    ): [str: string, values: PrimitiveData[]] {
        const conditions: string[] = []
        const values: PrimitiveData[] = []

        type StringKey = ("title" | "author" | "press" | "category") &
            keyof BookSearchParams
        type RangeKey = ("price" | "year") & keyof BookSearchParams
        const stringKeys: StringKey[] = ["title", "author", "press", "category"]
        const rangeKeys: RangeKey[] = ["price", "year"]

        stringKeys.forEach((key) => {
            if (!params[key]) return
            conditions.push(`instr(${key}, ?) > 0`)
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            values.push(params[key]!)
        })
        rangeKeys.forEach((key) => {
            if (!params[key]) return
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const [l, r] = params[key]!
            if (l) {
                conditions.push(`${key} >= ?`)
                values.push(l)
            }
            if (r) {
                conditions.push(`${key} <= ?`)
                values.push(r)
            }
        })

        const conditionString =
            conditions.length > 0 ? `where ${conditions.join(" and ")}` : ""
        return [conditionString, values]
    }
}
