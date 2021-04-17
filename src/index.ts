import Database from "./database"

async function main() {
    const user = "librarian"
    const password = "Librarian#1"
    const database = "library"
    const db = new Database(user, password, database)

    const result = await db.query("select * from book")
    console.log(result[0])

    await db.close()
}

main()
