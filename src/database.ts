import * as mysql from "mysql"
import {
    BookInfo,
    BookRow,
    BookSearchParams,
    ManagerRow,
    PrimitiveData,
} from "./typing"

export default class Database {
    private readonly connection: mysql.Connection

    constructor(user: string, password: string, database?: string) {
        this.connection = mysql.createConnection({ user, password, database })
    }

    async close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection.end((err) => reject(err))
            resolve()
        })
    }

    async checkManager(name: string, password: string): Promise<boolean> {
        const managers = await this.query<ManagerRow>(
            "select * from manager where name = ? and password = ?",
            [name, password]
        )
        return managers.length == 1
    }

    async addBooks(books: BookInfo[]): Promise<void> {
        await this.query("insert into book values ?", [
            books.map(this.convertBookInfo),
        ])
    }

    async searchBook(
        params: BookSearchParams,
        sortingKey: keyof BookRow = "title",
        ascending = true
    ): Promise<BookRow[]> {
        const [conditionString, values] = this.getSearchCondition(params)
        const sqlString =
            "select * from book" +
            conditionString +
            ` order by ${sortingKey} ${ascending ? "ASC" : "DESC"}`
        return await this.query<BookRow>(sqlString, values)
    }

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
            conditions.length > 0 ? ` where ${conditions.join(" and ")}` : ""
        return [conditionString, values]
    }

    private async query<T>(
        sqlString: string,
        values?: PrimitiveData[]
    ): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.connection.query(sqlString, values, (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
        })
    }
}
