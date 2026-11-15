import pool from '../config/database.js'
import { formatUser } from '../utils/formatters.js'

export async function listUsers(_request, response) {
  const { rows } = await pool.query('SELECT * FROM users ORDER BY id DESC')
  response.json(rows.map(formatUser))
}

export async function createUser(request, response) {
  const { name, email, role } = request.body
  const { rows } = await pool.query('INSERT INTO users (name, email, role) VALUES ($1, LOWER($2), $3) RETURNING *', [name, email, role])
  response.status(201).json(formatUser(rows[0]))
}

export async function updateUser(request, response) {
  const { name, email, role } = request.body
  const { rows } = await pool.query(
    'UPDATE users SET name = $1, email = LOWER($2), role = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
    [name, email, role, request.params.id],
  )
  if (!rows[0]) return response.status(404).json({ error: 'Usuario no encontrado.' })
  response.json(formatUser(rows[0]))
}

export async function setUserStatus(request, response) {
  const { rows } = await pool.query('UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [Boolean(request.body.active), request.params.id])
  if (!rows[0]) return response.status(404).json({ error: 'Usuario no encontrado.' })
  response.json(formatUser(rows[0]))
}