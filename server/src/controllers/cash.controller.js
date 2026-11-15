import pool from '../config/database.js'
import { formatPayment } from '../utils/formatters.js'

export async function listPaymentRows() {
  const { rows } = await pool.query(`SELECT p.*, o.ticket_code, COALESCE(o.plate, p.plate) AS plate
    FROM payments p LEFT JOIN operations o ON o.id = p.operation_id ORDER BY p.paid_at DESC`)
  return rows
}

export async function listPayments(_request, response) {
  response.json((await listPaymentRows()).map(formatPayment))
}

export async function createPayment(request, response) {
  const amount = Number(request.body.amount)
  const method = request.body.method === 'QR' ? 'QR' : 'Efectivo'
  const ticket = request.body.ticket ? String(request.body.ticket).trim().toUpperCase() : null
  if (!Number.isFinite(amount) || amount <= 0) return response.status(400).json({ error: 'El importe debe ser mayor que cero.' })
  const { rows } = await pool.query(
    `INSERT INTO payments (operation_id, plate, amount, method)
     VALUES ((SELECT id FROM operations WHERE UPPER(ticket_code) = $1 LIMIT 1), $2, $3, $4) RETURNING id`,
    [ticket, request.body.plate ? String(request.body.plate).trim().toUpperCase() : null, amount, method],
  )
  const result = await pool.query(`SELECT p.*, o.ticket_code, COALESCE(o.plate, p.plate) AS plate
    FROM payments p LEFT JOIN operations o ON o.id = p.operation_id WHERE p.id = $1`, [rows[0].id])
  response.status(201).json(formatPayment(result.rows[0]))
}