import * as mysql from "mysql"
import { PrimitiveData } from "./typing"

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

    async query(sqlString: string, values?: PrimitiveData[]): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.connection.query(sqlString, values, (err, result, _) => {
                if (err) reject(err)
                resolve(result)
            })
        })
    }
}