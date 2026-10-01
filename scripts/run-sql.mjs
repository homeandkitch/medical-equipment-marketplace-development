import { readFileSync } from 'node:fs'
import pg from 'pg'

const file = process.argv[2]
if (!file) throw new Error('Usage: node scripts/run-sql.mjs <file.sql>')

const connectionString = process.env.POSTGRES_URL_NON_POOLING?.replace(/[?&]sslmode=[^&]*/, '')
const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })

await client.connect()
try {
  await client.query(readFileSync(file, 'utf8'))
  console.log(`Applied ${file}`)
} finally {
  await client.end()
}
