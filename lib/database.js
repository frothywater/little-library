"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require("mysql");
class Database {
    constructor(user, password, database) {
        this.connection = mysql.createConnection({ user, password, database });
    }
    async connect() {
        return new Promise((resolve, reject) => {
            this.connection.connect((err) => {
                if (err)
                    reject(err);
                resolve();
            });
        });
    }
    async close() {
        return new Promise((resolve, reject) => {
            this.connection.end((err) => {
                if (err)
                    reject(err);
                resolve();
            });
        });
    }
    async query(sqlString, values) {
        return new Promise((resolve, reject) => {
            this.connection.query(sqlString, values, (err, result) => {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
    }
    async transaction(action) {
        return new Promise((resolve, reject) => {
            this.connection.beginTransaction(async (err) => {
                if (err)
                    reject(err);
                await action().catch((err) => reject(err));
                this.connection.commit((err) => {
                    if (err)
                        this.connection.rollback(() => reject(err));
                    resolve();
                });
            });
        });
    }
}
exports.default = Database;
