import pg from 'pg'
import process from 'node:process'

const { Pool } = pg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

pool.on('error', (error) => {
  console.error('Error inesperado en el pool de PostgreSQL:', error.message)
})

export default pool