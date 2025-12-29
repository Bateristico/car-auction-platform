import Database from "better-sqlite3"
import * as fs from "fs"
import * as path from "path"

const db = new Database("./dev.db")

// Get all tables
const tables = db
  .prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%'"
  )
  .all() as { name: string }[]

console.log("Tables found:", tables.map((t) => t.name))

// Create export directory
const exportDir = "./prisma/data"
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true })
}

// Export each table
for (const table of tables) {
  const rows = db.prepare(`SELECT * FROM ${table.name}`).all()
  console.log(`${table.name}: ${rows.length} rows`)

  if (rows.length > 0) {
    const filePath = path.join(exportDir, `${table.name}.json`)
    fs.writeFileSync(filePath, JSON.stringify(rows, null, 2))
    console.log(`  -> Exported to ${filePath}`)
  }
}

db.close()
console.log("\nExport complete!")
