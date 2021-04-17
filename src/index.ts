import Database from "./database"

async function main() {
    const user = "librarian"
    const password = "Librarian#1"
    const database = "library"
    const db = new Database(user, password, database)

    console.log(await db.checkManager("cobalt", "12345678"))
    await db.close()
}

main()
