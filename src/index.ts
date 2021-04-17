import Database from "./database"
import Library from "./library"

async function main() {
    const user = "librarian"
    const password = "Librarian#1"
    const database = "library"
    const db = new Database(user, password, database)
    const library = new Library(db)

    console.log(await library.checkManager("cobalt", "12345678"))
    console.log(
        await library.addBooks([
            {
                title: "Boiled Eggs",
                author: "Music Eater",
                press: "Ming Dynasty",
                category: "Food",
                price: 10.0,
                year: 2018,
                count: 10,
            },
        ])
    )
    console.log(
        await library.searchBook(
            { title: "H", price: [undefined, 20] },
            "author",
            false
        )
    )
    console.log(await library.getBorrowedBooks(1))
    console.log(await library.borrowBook(1, 1, 1))
    console.log(await library.returnBook(1, 1))

    await db.close()
}

main().catch((err) => {
    console.error(err.message)
    console.error(err.sql)
})
