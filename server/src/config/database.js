import pg from 'pg'
import process from 'node:process'

const { Pool } = pg

const pool = new Pool(process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE || 'estacionamiento',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD,
    })

pool.on('error', (error) => {
  console.error('Error inesperado en el pool de PostgreSQL:', error.message)
})

export default pool