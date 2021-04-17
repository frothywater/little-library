import Database from "./database"
import Library from "./library"

async function main() {
    const user = "librarian"
    const password = "Librarian#1"
    const database = "library"
    const db = new Database(user, password, database)
    const library = new Library(db)

    console.log(await library.checkManager("cobalt", "12345678"))

    await db.close()
}

main().catch((err) => {
    console.error(err.message)
    console.error(err.sql)
})
