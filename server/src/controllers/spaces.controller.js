import pool from '../config/database.js'
import { formatSpace } from '../utils/formatters.js'

export async function listSpaces(_request, response) {
  const { rows } = await pool.query('SELECT * FROM parking_spaces ORDER BY floor, sector, code')
  response.json(rows.map(formatSpace))
}

export async function createSpace(request, response) {
  const { code, floor, sector, type } = request.body
  const status = request.body.status === 'Mantenimiento' ? 'maintenance' : 'available'
  if (request.body.status === 'Ocupado') {
    return response.status(409).json({ error: 'Para ocupar este espacio, registra una entrada y asigna un vehículo.' })
  }
  const { rows } = await pool.query(
    `INSERT INTO parking_spaces (code, floor, sector, space_type, status)
     VALUES (UPPER($1), $2, $3, $4, $5) RETURNING *`,
    [code, floor, sector, type, status],
  )
  response.status(201).json(formatSpace(rows[0]))
}

export async function updateSpace(request, response) {
  const { code, floor, sector, type } = request.body
  const statusMap = { Disponible: 'available', Ocupado: 'occupied', Mantenimiento: 'maintenance' }
  const requestedStatus = statusMap[request.body.status]
  if (!requestedStatus) return response.status(400).json({ error: 'Selecciona un estado válido para el espacio.' })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const current = await client.query('SELECT * FROM parking_spaces WHERE id = $1 FOR UPDATE', [request.params.id])
    if (!current.rows[0]) {
      await client.query('ROLLBACK')
      return response.status(404).json({ error: 'Espacio no encontrado.' })
    }
    const operation = await client.query("SELECT id FROM operations WHERE space_id = $1 AND status = 'active' LIMIT 1 FOR UPDATE", [request.params.id])
    if (operation.rows[0] && requestedStatus !== 'occupied') {
      await client.query('ROLLBACK')
      return response.status(409).json({ error: 'Este espacio tiene un vehículo en curso. Registra la salida antes de cambiarlo.' })
    }
    if (requestedStatus === 'occupied' && !operation.rows[0]) {
      await client.query('ROLLBACK')
      return response.status(409).json({ error: 'Para ocupar este espacio, registra la entrada y asigna un vehículo.' })
    }
    const { rows } = await client.query(
      `UPDATE parking_spaces SET code = UPPER($1), floor = $2, sector = $3,
       space_type = $4, status = $5, updated_at = NOW() WHERE id = $6 RETURNING *`,
      [code, floor, sector, type, requestedStatus, request.params.id],
    )
    await client.query('COMMIT')
    response.json(formatSpace(rows[0]))
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function setSpaceStatus(request, response) {
  const { active } = request.body
  const { rows } = await pool.query(
    `UPDATE parking_spaces SET is_active = $1, updated_at = NOW()
     WHERE id = $2 AND (status <> 'occupied' OR $1 = TRUE) RETURNING *`,
    [Boolean(active), request.params.id],
  )
  if (!rows[0]) return response.status(409).json({ error: 'No se puede desactivar un espacio ocupado.' })
  response.json(formatSpace(rows[0]))
}