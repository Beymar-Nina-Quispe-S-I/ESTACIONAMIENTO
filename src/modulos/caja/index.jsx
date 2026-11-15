import { useMemo, useState } from 'react'

const currency = (amount) => `$${Number(amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function Cash({ items, vehicles = [], operations = [], clients = [], onPayment }) {
  const [formOpen, setFormOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [plate, setPlate] = useState('')
  const [ticket, setTicket] = useState('')
  const todayPayments = useMemo(() => items.filter((item) => new Date(item.paid_at).toDateString() === new Date().toDateString()), [items])
  const total = todayPayments.reduce((sum, item) => sum + Number(item.amount), 0)
  const selectedVehicle = vehicles.find((vehicle) => vehicle.plate.toUpperCase() === plate.trim().toUpperCase())
  const selectedClient = clients.find((client) => Number(client.id) === Number(selectedVehicle?.client_id))
  const submitPayment = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setBusy(true)
    try {
      await onPayment(Object.fromEntries(formData.entries()))
      setFormOpen(false)
      setPlate('')
      setTicket('')
    } finally {
      setBusy(false)
    }
  }

  return <>
    <div className="page-heading"><div><div className="eyebrow">Administración</div><h1>Caja y cobros</h1><p>Consulta transacciones y registra pagos recibidos.</p></div><button type="button" className="btn btn-primary" onClick={() => setFormOpen(true)}><i className="bi bi-plus-lg" />Registrar pago</button></div>
    <div className="stat-grid"><article className="stat-card"><div className="stat-head">Ingresos de hoy<span className="stat-icon"><i className="bi bi-cash-stack" /></span></div><div className="stat-value">{currency(total)}</div><div className="stat-foot">{todayPayments.length} transacciones registradas</div></article><article className="stat-card"><div className="stat-head">Efectivo<span className="stat-icon"><i className="bi bi-wallet2" /></span></div><div className="stat-value">{currency(todayPayments.filter((item) => item.method === 'Efectivo').reduce((sum, item) => sum + Number(item.amount), 0))}</div><div className="stat-foot">Cobros en efectivo de hoy</div></article><article className="stat-card"><div className="stat-head">QR simulado<span className="stat-icon"><i className="bi bi-qr-code" /></span></div><div className="stat-value">{currency(todayPayments.filter((item) => item.method === 'QR').reduce((sum, item) => sum + Number(item.amount), 0))}</div><div className="stat-foot">Cobros QR de hoy</div></article><article className="stat-card"><div className="stat-head">Transacciones<span className="stat-icon"><i className="bi bi-receipt" /></span></div><div className="stat-value">{items.length}</div><div className="stat-foot">Movimientos de caja registrados</div></article></div>
    <section className="panel"><div className="panel-header"><h2>Historial de cobros</h2><span>{items.length} transacciones</span></div><div className="table-wrap"><table className="management-table"><thead><tr><th>FECHA Y HORA</th><th>TICKET</th><th>PLACA</th><th>MÉTODO DE PAGO</th><th>IMPORTE</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{new Date(item.paid_at).toLocaleString('es-MX')}</td><td>{item.ticket || 'Pago manual'}</td><td>{item.plate || '—'}</td><td><span className="status-badge status-completed">{item.method}</span></td><td className="record-primary">{currency(item.amount)}</td></tr>)}</tbody></table>{items.length === 0 && <div className="empty-state">No hay cobros registrados.</div>}</div></section>
    {formOpen && <div className="modal-backdrop-custom"><section className="form-dialog" role="dialog" aria-modal="true"><header className="dialog-head"><h2>Registrar pago</h2><button type="button" aria-label="Cerrar" onClick={() => setFormOpen(false)}><i className="bi bi-x-lg" /></button></header><form className="dialog-body" onSubmit={submitPayment}><div className="form-grid"><div className="form-field"><label htmlFor="payment-ticket">Buscar ticket (opcional)</label><input id="payment-ticket" className="form-control" name="ticket" list="registered-tickets" placeholder="Escribe o selecciona un ticket" value={ticket} onChange={(event) => { setTicket(event.target.value); const match = operations.find((operation) => operation.ticket.toUpperCase() === event.target.value.trim().toUpperCase()); if (match) setPlate(match.plate) }} /><datalist id="registered-tickets">{operations.map((operation) => <option value={operation.ticket} key={operation.id}>{operation.plate} · {operation.space}</option>)}</datalist></div><div className="form-field"><label htmlFor="payment-plate">Buscar placa (opcional)</label><input id="payment-plate" className="form-control" name="plate" list="registered-plates" placeholder="Escribe o selecciona una placa" value={plate} onChange={(event) => setPlate(event.target.value)} /><datalist id="registered-plates">{vehicles.map((vehicle) => { const owner = clients.find((client) => Number(client.id) === Number(vehicle.client_id))?.name || vehicle.owner || 'Visitante'; return <option value={vehicle.plate} key={vehicle.id}>{vehicle.brand} {vehicle.model} · {owner}</option> })}</datalist></div>{selectedVehicle && <div className="form-field full"><div className="selected-vehicle-summary"><span className="selected-vehicle-icon"><i className="bi bi-car-front-fill" /></span><div><strong>{selectedVehicle.plate}</strong><span>{selectedVehicle.brand} {selectedVehicle.model}</span></div><b>{selectedClient?.name || selectedVehicle.owner || 'Visitante'}</b></div></div>}<div className="form-field"><label htmlFor="payment-amount">Importe</label><input id="payment-amount" className="form-control" name="amount" type="number" min="0.01" step="0.01" required /></div><div className="form-field"><label htmlFor="payment-mode">Método</label><select id="payment-mode" name="method" className="form-select"><option>Efectivo</option><option>QR</option></select></div></div><div className="form-actions"><button type="button" className="btn btn-outline-secondary" onClick={() => setFormOpen(false)}>Cancelar</button><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar pago'}</button></div></form></section></div>}
  </>
}