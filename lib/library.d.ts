import Database from "./database";
import { BookInfo, BookRow, BookSearchParams, BorrowResult, CardInfo, CardRow, LibraryOptions, ManagerRow } from "./typing";
export default class Library {
    private readonly db;
    options: LibraryOptions;
    constructor(db: Database, options?: LibraryOptions);
    checkManager(name: string, password: string): Promise<ManagerRow | null>;
    addBooks(books: BookInfo[]): Promise<void>;
    addCard(card: CardInfo): Promise<void>;
    deleteCard(card_id: number): Promise<void>;
    existBook(book_id: number): Promise<boolean>;
    existCard(card_id: number): Promise<boolean>;
    getAllCards(): Promise<CardRow[]>;
    searchBook(params: BookSearchParams, sortingKey?: keyof BookRow, ascending?: boolean): Promise<BookRow[]>;
    getBorrowedBooks(card_id: number): Promise<BookRow[]>;
    borrowBook(card_id: number, book_id: number, manager_id: number): Promise<BorrowResult>;
    returnBook(card_id: number, book_id: number): Promise<boolean>;
    getBorrowStatus(card_id: number, book_id: number): Promise<boolean>;
    close(): Promise<void>;
    private getStock;
    private getMinDueDate;
    private convertBookInfo;
    private getSearchCondition;
}
//# sourceMappingURL=library.d.ts.map