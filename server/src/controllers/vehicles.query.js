import pool from '../config/database.js'

export async function listVehicleRows() {
  const { rows } = await pool.query(`SELECT v.*, COALESCE(c.name, v.visitor_name, 'Visitante') AS owner
    FROM vehicles v LEFT JOIN clients c ON c.id = v.client_id ORDER BY v.id DESC`)
  return rows
}