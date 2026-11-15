import pool from '../config/database.js'
import process from 'node:process'
import { formatClient, formatOperation, formatPayment, formatSpace, formatUser, formatVehicle } from '../utils/formatters.js'
import { listOperationRows } from './operations.controller.js'
import { listPaymentRows } from './cash.controller.js'
import { listVehicleRows } from './vehicles.query.js'

export async function getDashboard(_request, response) {
  const [users, clients, vehicles, spaces, operations, payments] = await Promise.all([
    pool.query('SELECT * FROM users ORDER BY id DESC'),
    pool.query('SELECT * FROM clients ORDER BY id DESC'),
    listVehicleRows(),
    pool.query('SELECT * FROM parking_spaces ORDER BY floor, sector, code'),
    listOperationRows(),
    listPaymentRows(),
  ])
  response.json({
    hourly_rate: Number(process.env.PARKING_RATE_PER_HOUR || 5),
    users: users.rows.map(formatUser),
    clients: clients.rows.map(formatClient),
    vehicles: vehicles.map(formatVehicle),
    spaces: spaces.rows.map(formatSpace),
    operations: operations.map(formatOperation),
    payments: payments.map(formatPayment),
  })
}