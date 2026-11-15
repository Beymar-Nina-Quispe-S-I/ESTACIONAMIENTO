import pool from '../config/database.js'
import { formatVehicle } from '../utils/formatters.js'

const selectVehicles = `SELECT v.*, COALESCE(c.name, v.visitor_name, 'Visitante') AS owner
  FROM vehicles v LEFT JOIN clients c ON c.id = v.client_id`

export async function listVehicles(_request, response) {
  const { rows } = await pool.query(`${selectVehicles} ORDER BY v.id DESC`)
  response.json(rows.map(formatVehicle))
}

export async function createVehicle(request, response) {
  const { plate, brand, model, color, type, client_id, image_data } = request.body
  const { rows } = await pool.query(
    `INSERT INTO vehicles (plate, brand, model, color, vehicle_type, client_id, image_data)
     VALUES (UPPER($1), $2, $3, $4, $5, NULLIF($6, '')::INTEGER, $7) RETURNING *`,
    [plate, brand, model, color || null, type, client_id ?? null, image_data || null],
  )
  const result = await pool.query(`${selectVehicles} WHERE v.id = $1`, [rows[0].id])
  response.status(201).json(formatVehicle(result.rows[0]))
}

export async function updateVehicle(request, response) {
  const { plate, brand, model, color, type, client_id, image_data } = request.body
  const { rows } = await pool.query(
    `UPDATE vehicles SET plate = UPPER($1), brand = $2, model = $3, color = $4,
     vehicle_type = $5, client_id = NULLIF($6, '')::INTEGER,
     image_data = COALESCE($7, image_data), updated_at = NOW()
     WHERE id = $8 RETURNING id`,
    [plate, brand, model, color || null, type, client_id ?? null, image_data || null, request.params.id],
  )
  if (!rows[0]) return response.status(404).json({ error: 'Vehículo no encontrado.' })
  const result = await pool.query(`${selectVehicles} WHERE v.id = $1`, [rows[0].id])
  response.json(formatVehicle(result.rows[0]))
}

export async function setVehicleStatus(request, response) {
  const { rows } = await pool.query('UPDATE vehicles SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id', [Boolean(request.body.active), request.params.id])
  if (!rows[0]) return response.status(404).json({ error: 'Vehículo no encontrado.' })
  const result = await pool.query(`${selectVehicles} WHERE v.id = $1`, [rows[0].id])
  response.json(formatVehicle(result.rows[0]))
}