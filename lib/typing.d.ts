export declare type PrimitiveData = number | string | Date | null | undefined | PrimitiveData[];
export interface BookRow {
    id: number;
    title?: string;
    author?: string;
    press?: string;
    category?: string;
    year?: number;
    price: number;
    total: number;
    stock: number;
}
export declare enum CardType {
    teacher = "Teacher",
    student = "Student"
}
export interface CardRow {
    id: number;
    name?: string;
    address?: string;
    type: CardType;
}
export interface ManagerRow {
    id: number;
    password: string;
    name?: string;
    phone?: string;
}
export interface BorrowRow {
    card_id: number;
    book_id: number;
    borrow_date: Date;
    due_date: Date;
    manager_id?: number;
}
export interface BookInfo {
    title: string;
    author: string;
    press: string;
    category: string;
    year: number;
    price: number;
    count: number;
}
export interface CardInfo {
    name: string;
    address?: string;
    type: CardType;
}
export declare type Range = [l?: number, r?: number];
export interface BookSearchParams {
    title?: string;
    author?: string;
    press?: string;
    category?: string;
    year?: Range;
    price?: Range;
}
export interface BorrowResult {
    success: boolean;
    estimatedAvailableDate?: Date;
}
export interface LibraryOptions {
    borrowDuration: number;
}
//# sourceMappingURL=typing.d.ts.map