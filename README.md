# little-library

A little library management system based on MySQL.
This package contains core logic of the system, and should be work together with `little-library-cli` and `little-library-app`.

Declaration: This project as a coursework of _Database Manage System_ fully belongs to @frothywater.

## Library

Class `Library` provides essential library operation.

```ts
checkManager(name: string, password: string): Promise<ManagerRow | null>

existBook(book_id: number): Promise<boolean>
existCard(card_id: number): Promise<boolean>

getAllCards(): Promise<CardRow[]>
getBorrowedBooks(card_id: number): Promise<BookRow[]>
getBorrowStatus(card_id: number, book_id: number): Promise<boolean>
searchBook(params: BookSearchParams, sortingKey?: keyof BookRow, ascending?: boolean): Promise<BookRow[]>

addBooks(books: BookInfo[]): Promise<void>
addCard(card: CardInfo): Promise<void>
deleteCard(card_id: number): Promise<void>

borrowBook(card_id: number, book_id: number, manager_id: number): Promise<BorrowResult>
returnBook(card_id: number, book_id: number): Promise<boolean>

close(): Promise<void>
```

## Database

Class `Database` provides underlying communication with the database.

```ts
connect(): Promise<void>;
close(): Promise<void>;
query<T>(sqlString: string, values?: PrimitiveData[]): Promise<T[]>;
transaction(action: () => Promise<void>): Promise<void>;
```
