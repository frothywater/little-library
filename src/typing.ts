export type PrimitiveData = number | string | Date | PrimitiveData[]

export interface BookRow {
    id: number
    title?: string
    author?: string
    press?: string
    category?: string
    year?: number
    price: number
    total: number
    stock: number
}

export enum CardType {
    teacher = "Teacher",
    student = "Student",
}

export interface CardRow {
    id: number
    name?: string
    address?: string
    type: CardType
}

export interface ManagerRow {
    id: number
    password: string
    name?: string
    phone?: string
}

export interface BorrowRow {
    id: number
    book_id: number
    card_id: number
    borrow_date: Date
    due_date: Date
    manager_id?: number
}

export interface BookInfo {
    id: number
    title: string
    author: string
    press: string
    category: string
    year: number
    price: number
    count: number
}
