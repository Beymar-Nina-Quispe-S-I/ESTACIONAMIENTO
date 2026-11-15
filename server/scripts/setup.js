import 'dotenv/config'
import process from 'node:process'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import pool from '../src/config/database.js'

const directory = path.dirname(fileURLToPath(import.meta.url))

try {
  const schema = await readFile(path.join(directory, '../sql/schema.sql'), 'utf8')
  const seed = await readFile(path.join(directory, '../sql/seed.sql'), 'utf8')
  await pool.query(schema)
  await pool.query(seed)
  console.log('Esquema creado y datos de ejemplo cargados.')
} catch (error) {
  console.error('No se pudo inicializar PostgreSQL:', error.message)
  process.exitCode = 1
} finally {
  await pool.end()
}