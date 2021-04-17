import Database from "./database"
import {
    BookInfo,
    BookRow,
    BookSearchParams,
    ManagerRow,
    PrimitiveData,
} from "./typing"

export default class Library {
    private readonly db: Database

    constructor(db: Database) {
        this.db = db
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

    /* MARK: - Helper functions */

    private convertBookInfo(book: BookInfo): PrimitiveData[] {
        const { id, title, author, press, category, year, price, count } = book
        return [id, title, author, press, category, year, price, count, count]
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
