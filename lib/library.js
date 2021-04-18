"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultOptions = { borrowDuration: 60 };
class Library {
    constructor(db, options = defaultOptions) {
        this.db = db;
        this.options = options;
    }
    /* MARK: - Query functions */
    async checkManager(name, password) {
        const managers = await this.db.query("select * from manager where name = ? and password = ?", [name, password]);
        return managers.length > 0 ? managers[0] : null;
    }
    async addBooks(books) {
        await this.db.query("insert into book values ?", [
            books.map(this.convertBookInfo),
        ]);
    }
    async addCard(card) {
        await this.db.query("insert into card values ?", [
            [[undefined, card.name, card.address, card.type]],
        ]);
    }
    async deleteCard(card_id) {
        await this.db.query("delete from card where id = ?", [card_id]);
    }
    async existBook(book_id) {
        const books = await this.db.query("select * from book where id = ?", [book_id]);
        return books.length > 0;
    }
    async existCard(card_id) {
        const cards = await this.db.query("select * from card where id = ?", [card_id]);
        return cards.length > 0;
    }
    async getAllCards() {
        return await this.db.query("select * from card");
    }
    async searchBook(params, sortingKey = "title", ascending = true) {
        const [conditionString, values] = this.getSearchCondition(params);
        const sqlString = `select * from book
             ${conditionString}
             order by ${sortingKey} ${ascending ? "ASC" : "DESC"}`;
        return await this.db.query(sqlString, values);
    }
    async getBorrowedBooks(card_id) {
        const sqlString = `select * from book where id in 
        (select book_id from borrow where card_id = ?)`;
        return await this.db.query(sqlString, [card_id]);
    }
    async borrowBook(card_id, book_id, manager_id) {
        const stock = await this.getStock(book_id);
        const borrowed = await this.getBorrowStatus(card_id, book_id);
        if (stock > 0 && !borrowed) {
            const borrowDate = new Date();
            const dueDate = new Date();
            dueDate.setDate(borrowDate.getDate() + this.options.borrowDuration);
            await this.db.transaction(async () => {
                await this.db.query("update book set stock = stock - 1 where id = ?", [book_id]);
                await this.db.query("insert into borrow values ?", [
                    [[book_id, card_id, borrowDate, dueDate, manager_id]],
                ]);
            });
            return { success: true };
        }
        else {
            return {
                success: false,
                estimatedAvailableDate: await this.getMinDueDate(book_id),
            };
        }
    }
    async returnBook(card_id, book_id) {
        const borrowed = await this.getBorrowStatus(card_id, book_id);
        if (!borrowed)
            return false;
        await this.db.transaction(async () => {
            await this.db.query("update book set stock = stock + 1 where id = ?", [book_id]);
            await this.db.query("delete from borrow where book_id = ? and card_id = ?", [book_id, card_id]);
        });
        return true;
    }
    async getBorrowStatus(card_id, book_id) {
        const result = await this.db.query("select * from borrow where card_id = ? and book_id = ?", [card_id, book_id]);
        return result.length > 0;
    }
    async close() {
        await this.db.close();
    }
    /* MARK: - Helper functions */
    async getStock(book_id) {
        const result = await this.db.query("select stock from book where id = ?", [book_id]);
        return result[0].stock;
    }
    async getMinDueDate(book_id) {
        const result = await this.db.query("select min(due_date) as date from borrow where book_id = ?", [book_id]);
        return result[0].date;
    }
    convertBookInfo(book) {
        const { title, author, press, category, year, price, count } = book;
        return [null, title, author, press, category, year, price, count, count];
    }
    getSearchCondition(params) {
        const conditions = [];
        const values = [];
        const stringKeys = ["title", "author", "press", "category"];
        const rangeKeys = ["price", "year"];
        stringKeys.forEach((key) => {
            if (!params[key])
                return;
            conditions.push(`instr(${key}, ?) > 0`);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            values.push(params[key]);
        });
        rangeKeys.forEach((key) => {
            if (!params[key])
                return;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const [l, r] = params[key];
            if (l) {
                conditions.push(`${key} >= ?`);
                values.push(l);
            }
            if (r) {
                conditions.push(`${key} <= ?`);
                values.push(r);
            }
        });
        const conditionString = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";
        return [conditionString, values];
    }
}
exports.default = Library;
