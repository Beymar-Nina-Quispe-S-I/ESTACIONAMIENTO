import { randomInt } from 'node:crypto'
import process from 'node:process'
import pool from '../config/database.js'
import { formatOperation, formatPayment, formatSpace } from '../utils/formatters.js'

const operationQuery = `SELECT o.*, s.code AS space_code, COALESCE(v.brand || ' ' || v.model, 'Visitante') AS vehicle,
    v.vehicle_type, v.image_data, COALESCE(c.name, v.visitor_name, 'Visitante') AS owner_name,
    c.id AS client_id, c.phone AS client_phone, c.email AS client_email
  FROM operations o LEFT JOIN parking_spaces s ON s.id = o.space_id
  LEFT JOIN vehicles v ON v.id = o.vehicle_id
  LEFT JOIN clients c ON c.id = v.client_id`

export async function listOperationRows() {
  const { rows } = await pool.query(`${operationQuery} ORDER BY o.entry_at DESC`)
  return rows
}

export async function listOperations(_request, response) {
  response.json((await listOperationRows()).map(formatOperation))
}

export async function registerEntry(request, response) {
  const plate = String(request.body.plate || '').trim().toUpperCase()
  if (!plate) return response.status(400).json({ error: 'La placa es obligatoria.' })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const duplicate = await client.query("SELECT id FROM operations WHERE UPPER(plate) = $1 AND status = 'active'", [plate])
    if (duplicate.rows[0]) {
      await client.query('ROLLBACK')
      return response.status(409).json({ error: 'La placa ya tiene una entrada activa.' })
    }
    const space = await client.query(`SELECT * FROM parking_spaces WHERE is_active = TRUE AND status = 'available'
      ORDER BY floor, sector, code FOR UPDATE SKIP LOCKED LIMIT 1`)
    if (!space.rows[0]) {
      await client.query('ROLLBACK')
      return response.status(409).json({ error: 'No hay espacios disponibles.' })
    }
    const ticket = `TK-${Date.now().toString().slice(-8)}${randomInt(10, 99)}`
    const vehicle = await client.query('SELECT id FROM vehicles WHERE UPPER(plate) = $1 AND is_active = TRUE LIMIT 1', [plate])
    const inserted = await client.query(
      `INSERT INTO operations (ticket_code, plate, vehicle_id, space_id) VALUES ($1, $2, $3, $4) RETURNING *`,
      [ticket, plate, vehicle.rows[0]?.id || null, space.rows[0].id],
    )
    await client.query("UPDATE parking_spaces SET status = 'occupied', updated_at = NOW() WHERE id = $1", [space.rows[0].id])
    await client.query('COMMIT')
    const result = await pool.query(`${operationQuery} WHERE o.id = $1`, [inserted.rows[0].id])
    response.status(201).json(formatOperation(result.rows[0]))
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function registerExit(request, response) {
  const lookup = String(request.params.ticket || '').trim().toUpperCase()
  const method = request.body.method === 'QR' ? 'QR' : 'Efectivo'
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const found = await client.query(`${operationQuery} WHERE (UPPER(o.ticket_code) = $1 OR UPPER(o.plate) = $1) AND o.status = 'active' FOR UPDATE OF o`, [lookup])
    const operation = found.rows[0]
    if (!operation) {
      await client.query('ROLLBACK')
      return response.status(404).json({ error: 'No se encontró una operación activa con ese ticket o placa.' })
    }
    const rate = Number(process.env.PARKING_RATE_PER_HOUR || 5)
    const elapsedMinutes = Math.max(1, Math.ceil((Date.now() - new Date(operation.entry_at).getTime()) / 60000))
    const amount = Math.max(rate, Math.ceil(elapsedMinutes / 60) * rate)
    const updated = await client.query(
      `UPDATE operations SET exit_at = NOW(), amount = $1, status = 'completed' WHERE id = $2 RETURNING *`,
      [amount, operation.id],
    )
    const paid = await client.query(
      `INSERT INTO payments (operation_id, amount, method) VALUES ($1, $2, $3) RETURNING *`,
      [operation.id, amount, method],
    )
    const spaceRows = await client.query(
      `UPDATE parking_spaces SET status = 'available', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [operation.space_id],
    )
    await client.query('COMMIT')
    const operationResult = await pool.query(`${operationQuery} WHERE o.id = $1`, [updated.rows[0].id])
    const paymentResult = await pool.query(`SELECT p.*, o.ticket_code, o.plate FROM payments p LEFT JOIN operations o ON o.id = p.operation_id WHERE p.id = $1`, [paid.rows[0].id])
    response.json({ operation: formatOperation(operationResult.rows[0]), payment: formatPayment(paymentResult.rows[0]), space: formatSpace(spaceRows.rows[0]) })
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function assignVehicleToSpace(request, response) {
  const spaceId = Number(request.body.space_id)
  const vehicleId = Number(request.body.vehicle_id)
  if (!Number.isInteger(spaceId) || !Number.isInteger(vehicleId)) {
    return response.status(400).json({ error: 'Selecciona un espacio y un vehículo válidos.' })
  }
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const space = await client.query('SELECT * FROM parking_spaces WHERE id = $1 AND is_active = TRUE FOR UPDATE', [spaceId])
    if (!space.rows[0] || space.rows[0].status !== 'available') {
      await client.query('ROLLBACK')
      return response.status(409).json({ error: 'El espacio ya no está disponible.' })
    }
    const vehicle = await client.query('SELECT * FROM vehicles WHERE id = $1 AND is_active = TRUE FOR SHARE', [vehicleId])
    if (!vehicle.rows[0]) {
      await client.query('ROLLBACK')
      return response.status(404).json({ error: 'El vehículo seleccionado no existe o está inactivo.' })
    }
    const duplicate = await client.query("SELECT id FROM operations WHERE vehicle_id = $1 AND status = 'active'", [vehicleId])
    if (duplicate.rows[0]) {
      await client.query('ROLLBACK')
      return response.status(409).json({ error: 'Este vehículo ya tiene una entrada activa.' })
    }
    const ticket = `TK-${Date.now().toString().slice(-8)}${randomInt(10, 99)}`
    const inserted = await client.query(
      `INSERT INTO operations (ticket_code, plate, vehicle_id, space_id) VALUES ($1, $2, $3, $4) RETURNING id`,
      [ticket, vehicle.rows[0].plate, vehicleId, spaceId],
    )
    const occupied = await client.query("UPDATE parking_spaces SET status = 'occupied', updated_at = NOW() WHERE id = $1 RETURNING *", [spaceId])
    await client.query('COMMIT')
    const operationResult = await pool.query(`${operationQuery} WHERE o.id = $1`, [inserted.rows[0].id])
    response.status(201).json({ operation: formatOperation(operationResult.rows[0]), space: formatSpace(occupied.rows[0]) })
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}