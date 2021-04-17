import * as mysql from "mysql"
import { ManagerRow, PrimitiveData } from "./typing"

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
