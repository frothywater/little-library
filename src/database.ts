import * as mysql from "mysql"
import { PrimitiveData } from "./typing"

export default class Database {
    private readonly connection: mysql.Connection

    constructor(user: string, password: string, database?: string) {
        this.connection = mysql.createConnection({ user, password, database })
    }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection.connect((err) => reject(err))
            resolve()
        })
    }

    async close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection.end((err) => reject(err))
            resolve()
        })
    }

    async query<T>(sqlString: string, values?: PrimitiveData[]): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.connection.query(sqlString, values, (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
        })
    }

    async transaction(action: () => Promise<void>): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection.beginTransaction(async (err) => {
                if (err) reject(err)
                await action().catch((err) => reject(err))
                this.connection.commit((err) => {
                    if (err) this.connection.rollback(() => reject(err))
                    resolve()
                })
            })
        })
    }
}
