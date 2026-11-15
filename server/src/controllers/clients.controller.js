import pool from '../config/database.js'
import { formatClient } from '../utils/formatters.js'

export async function listClients(_request, response) {
  const { rows } = await pool.query('SELECT * FROM clients ORDER BY id DESC')
  response.json(rows.map(formatClient))
}

export async function createClient(request, response) {
  const { name, phone, email, agreement, monthly_rate, monthly_until } = request.body
  const { rows } = await pool.query(
    `INSERT INTO clients (name, phone, email, agreement, monthly_fee, monthly_until)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, phone, email || null, agreement || null, monthly_rate || 0, monthly_until || null],
  )
  response.status(201).json(formatClient(rows[0]))
}

export async function updateClient(request, response) {
  const { name, phone, email, agreement, monthly_rate, monthly_until } = request.body
  const { rows } = await pool.query(
    `UPDATE clients SET name = $1, phone = $2, email = $3, agreement = $4, monthly_fee = $5,
     monthly_until = $6, updated_at = NOW() WHERE id = $7 RETURNING *`,
    [name, phone, email || null, agreement || null, monthly_rate || 0, monthly_until || null, request.params.id],
  )
  if (!rows[0]) return response.status(404).json({ error: 'Cliente no encontrado.' })
  response.json(formatClient(rows[0]))
}

export async function setClientStatus(request, response) {
  const { rows } = await pool.query('UPDATE clients SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [Boolean(request.body.active), request.params.id])
  if (!rows[0]) return response.status(404).json({ error: 'Cliente no encontrado.' })
  response.json(formatClient(rows[0]))
}