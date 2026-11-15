const today = new Date()
const ago = (hours) => new Date(today.getTime() - hours * 3600000).toISOString()

export const demoData = {
  users: [
    { id: 1, name: 'Admin Central', email: 'admin@parkly.local', role: 'Administrador', active: true },
    { id: 2, name: 'Sofía Hernández', email: 'sofia@parkly.local', role: 'Operador', active: true },
    { id: 3, name: 'Luis Ramírez', email: 'luis@parkly.local', role: 'Cajero', active: true },
  ],
  clients: [
    { id: 1, name: 'María Fernanda López', phone: '555 018 2440', email: 'maria.lopez@email.com', agreement: 'Mensualidad individual', monthly_rate: 1450, monthly_until: '2026-12-01', active: true },
    { id: 2, name: 'Carlos Mendoza Ruiz', phone: '555 013 8702', email: 'c.mendoza@email.com', agreement: 'Convenio individual', monthly_rate: 1450, monthly_until: '2026-11-28', active: true },
    { id: 3, name: 'Andrea Salas', phone: '555 019 5401', email: 'andrea.salas@email.com', agreement: 'Mensualidad individual', monthly_rate: 1600, monthly_until: '2026-11-10', active: false },
    { id: 4, name: 'Grupo Cobalto', phone: '555 010 8891', email: 'flotilla@cobalto.com', agreement: 'Convenio flotilla', monthly_rate: 5200, monthly_until: '2026-12-15', active: true },
  ],
  vehicles: [
    { id: 1, plate: 'ABC-123-A', brand: 'Toyota', model: 'Corolla', color: 'Gris', type: 'Auto', client_id: 1, owner: 'María Fernanda López', description: 'Toyota Corolla', active: true },
    { id: 2, plate: 'JKL-456-B', brand: 'Honda', model: 'CB 190', color: 'Negro', type: 'Moto', client_id: 2, owner: 'Carlos Mendoza Ruiz', description: 'Honda CB 190', active: true },
    { id: 3, plate: 'MNO-789-C', brand: 'Nissan', model: 'NP300', color: 'Blanco', type: 'Camioneta', client_id: 4, owner: 'Grupo Cobalto', description: 'Nissan NP300', active: true },
    { id: 4, plate: 'XYZ-552-D', brand: 'Mazda', model: '3', color: 'Rojo', type: 'Auto', client_id: null, owner: 'Visitante', description: 'Mazda 3', active: true },
  ],
  spaces: Array.from({ length: 10 }, (_, index) => ({
    id: index + 1, code: `A-${String(index + 1).padStart(2, '0')}`, floor: 'Piso 1', sector: 'A', type: index === 9 ? 'Accesible' : 'General',
    status: [0, 1, 4].includes(index) ? 'Ocupado' : index === 9 ? 'Mantenimiento' : 'Disponible', active: true,
  })),
  operations: [
    { id: 1, ticket: 'TK-025841', plate: 'ABC-123-A', vehicle: 'Toyota Corolla', vehicle_type: 'Auto', space: 'A-01', entry_at: ago(1.3), status: 'En curso' },
    { id: 2, ticket: 'TK-025840', plate: 'JKL-456-B', vehicle: 'Honda CB 190', vehicle_type: 'Moto', space: 'A-02', entry_at: ago(2.1), status: 'En curso' },
    { id: 3, ticket: 'TK-025839', plate: 'XYZ-552-D', vehicle: 'Mazda 3', vehicle_type: 'Auto', space: 'A-03', entry_at: ago(3), exit_at: ago(2), amount: 10, status: 'Finalizado' },
    { id: 4, ticket: 'TK-025838', plate: 'MNO-789-C', vehicle: 'Nissan NP300', vehicle_type: 'Camioneta', space: 'A-05', entry_at: ago(4), status: 'En curso' },
  ],
  payments: [
    { id: 1, ticket: 'TK-025839', plate: 'XYZ-552-D', amount: 10, method: 'Efectivo', paid_at: ago(2) },
    { id: 2, ticket: 'TK-025832', plate: 'OPQ-241-A', amount: 15, method: 'QR', paid_at: ago(4) },
    { id: 3, ticket: 'TK-025829', plate: 'RST-908-B', amount: 20, method: 'Efectivo', paid_at: ago(6) },
  ],
}