const spaceStatus = { available: 'Disponible', occupied: 'Ocupado', maintenance: 'Mantenimiento' }
const operationStatus = { active: 'En curso', completed: 'Finalizado' }

export function formatClient(row) {
  return { id: row.id, name: row.name, phone: row.phone, email: row.email, agreement: row.agreement, monthly_rate: row.monthly_fee, monthly_until: row.monthly_until, active: row.is_active }
}

export function formatUser(row) {
  return { id: row.id, name: row.name, email: row.email, role: row.role, active: row.is_active }
}

export function formatVehicle(row) {
  return { id: row.id, plate: row.plate, brand: row.brand, model: row.model, color: row.color, type: row.vehicle_type, client_id: row.client_id, owner: row.owner, description: `${row.brand} ${row.model}`, image_data: row.image_data, active: row.is_active }
}

export function formatSpace(row) {
  return { id: row.id, code: row.code, floor: row.floor, sector: row.sector, type: row.space_type, status: spaceStatus[row.status], active: row.is_active }
}

export function formatOperation(row) {
  return {
    id: row.id,
    ticket: row.ticket_code,
    plate: row.plate,
    vehicle: row.vehicle || 'Visitante',
    vehicle_type: row.vehicle_type || 'Auto',
    image_data: row.image_data || null,
    owner: row.owner_name || 'Visitante',
    client: row.client_id ? { id: row.client_id, name: row.owner_name, phone: row.client_phone, email: row.client_email } : null,
    space: row.space_code,
    entry_at: row.entry_at,
    exit_at: row.exit_at,
    amount: row.amount,
    status: operationStatus[row.status],
  }
}

export function formatPayment(row) {
  return { id: row.id, ticket: row.ticket_code, plate: row.plate, amount: row.amount, method: row.method, paid_at: row.paid_at }
}