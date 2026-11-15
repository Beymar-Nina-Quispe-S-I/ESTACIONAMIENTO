import { useEffect, useState } from 'react'
import autoReference from '../../assets/vehiculos/auto-referencia.jpg'
import camionetaReference from '../../assets/vehiculos/camioneta-referencia.jpg'
import motoReference from '../../assets/vehiculos/moto-referencia.jpg'

const vehicleImages = { Auto: autoReference, Moto: motoReference, Camioneta: camionetaReference }
const currency = (amount) => `$${Number(amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const dateTime = (date) => new Date(date).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })

function clientFor(operation, vehicles, clients) {
  if (operation.client) return operation.client
  const vehicle = vehicles.find((item) => item.plate === operation.plate)
  return clients.find((item) => Number(item.id) === Number(vehicle?.client_id)) || { name: operation.owner || vehicle?.owner || 'Visitante' }
}

function elapsed(minutes) {
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  if (hours === 0) return `${remaining} min`
  return `${hours} h ${remaining} min`
}

export default function Operations({ items, spaces, vehicles, clients, hourlyRate = 5, onEntry, onExit }) {
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [selectedEntrySpaceId, setSelectedEntrySpaceId] = useState('')
  const [selectedExitId, setSelectedExitId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('Efectivo')
  const [invoice, setInvoice] = useState(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [clock, setClock] = useState(0)
  const active = items.filter((item) => item.status === 'En curso')
  const availableSpaces = spaces.filter((space) => space.active && space.status === 'Disponible')
  const activeVehicles = vehicles.filter((vehicle) => vehicle.active)
  const selectedVehicle = activeVehicles.find((vehicle) => String(vehicle.id) === selectedVehicleId)
  const selectedExit = active.find((operation) => String(operation.id) === String(selectedExitId))
  const exitClient = selectedExit ? clientFor(selectedExit, vehicles, clients) : null

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const getQuote = (operation) => {
    const minutes = Math.max(1, Math.ceil((clock - new Date(operation.entry_at).getTime()) / 60000))
    const billableHours = Math.max(1, Math.ceil(minutes / 60))
    return { minutes, billableHours, amount: billableHours * Number(hourlyRate) }
  }

  const handleEntry = async (event) => {
    event.preventDefault()
    if (!selectedVehicleId || !selectedEntrySpaceId) return setMessage('Selecciona el vehículo y el espacio disponible.')
    setBusy(true)
    setMessage('')
    try {
      await onEntry(selectedVehicleId, selectedEntrySpaceId)
      setSelectedVehicleId('')
      setSelectedEntrySpaceId('')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleExit = async () => {
    if (!selectedExit) return
    setBusy(true)
    setMessage('')
    try {
      const result = await onExit(selectedExit.ticket, paymentMethod)
      setInvoice({ ...result, client: exitClient, vehicle: selectedExit.vehicle, vehicle_type: selectedExit.vehicle_type, space: selectedExit.space })
      setSelectedExitId(null)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  const selectExit = (operation) => {
    setSelectedExitId(operation.id)
    setMessage('')
  }

  return <>
    <div className="page-heading"><div><div className="eyebrow">Control operativo</div><h1>Entradas y salidas</h1><p>Selecciona un vehículo y una plaza; para cobrar, elige una plaza ocupada.</p></div><span className="status-badge status-active">{active.length} vehículos dentro</span></div>

    <section className="panel operation-entry-panel">
      <div className="panel-header"><h2><i className="bi bi-box-arrow-in-right me-2" />Registrar entrada</h2><span>{availableSpaces.length} plazas disponibles</span></div>
      <form className="operation-entry-body" onSubmit={handleEntry}>
        <div className="entry-vehicle-select">
          <label htmlFor="entry-vehicle">Vehículo registrado</label>
          <select id="entry-vehicle" className="form-select" value={selectedVehicleId} onChange={(event) => { setSelectedVehicleId(event.target.value); setMessage('') }} required>
            <option value="">Seleccionar vehículo y placa...</option>
            {activeVehicles.map((vehicle) => {
              const owner = clients.find((client) => Number(client.id) === Number(vehicle.client_id))?.name || vehicle.owner || 'Visitante'
              return <option value={vehicle.id} key={vehicle.id}>{vehicle.plate} · {vehicle.brand} {vehicle.model} · {owner}</option>
            })}
          </select>
          {selectedVehicle && <div className="selected-vehicle-summary"><span className="selected-vehicle-icon"><i className={`bi ${selectedVehicle.type === 'Moto' ? 'bi-bicycle' : selectedVehicle.type === 'Camioneta' ? 'bi-truck' : 'bi-car-front-fill'}`} /></span><div><strong>{selectedVehicle.plate}</strong><span>{selectedVehicle.brand} {selectedVehicle.model} · {selectedVehicle.color || selectedVehicle.type}</span></div><b>{clients.find((client) => Number(client.id) === Number(selectedVehicle.client_id))?.name || selectedVehicle.owner || 'Visitante'}</b></div>}
        </div>
        <div className="entry-spaces-heading"><strong>Selecciona el espacio disponible</strong><span>Tarifa: {currency(hourlyRate)} por hora o fracción</span></div>
        <div className="entry-space-grid">{availableSpaces.map((space) => <button type="button" className={`entry-space-card ${String(selectedEntrySpaceId) === String(space.id) ? 'selected' : ''}`} key={space.id} onClick={() => { setSelectedEntrySpaceId(String(space.id)); setMessage('') }}><i className="bi bi-p-square" /><strong>{space.code}</strong><span>{space.floor} · Sector {space.sector}</span><small>{space.type}</small></button>)}{availableSpaces.length === 0 && <div className="empty-state">No hay espacios disponibles activos.</div>}</div>
        {message && !selectedExit && <div className="alert alert-danger py-2 mt-3 mb-0 small">{message}</div>}
        <div className="entry-submit-row"><span>{selectedVehicle && selectedEntrySpaceId ? `${selectedVehicle.plate} · ${availableSpaces.find((space) => String(space.id) === selectedEntrySpaceId)?.code}` : 'Elige una placa y una plaza para continuar.'}</span><button type="submit" className="btn btn-primary" disabled={busy || !selectedVehicleId || !selectedEntrySpaceId}><i className="bi bi-check2-circle" />{busy ? 'Registrando…' : 'Registrar entrada'}</button></div>
      </form>
    </section>

    <section className="panel exit-space-panel">
      <div className="panel-header"><h2><i className="bi bi-box-arrow-right me-2" />Registrar salida</h2><span>{active.length} plazas ocupadas</span></div>
      <div className="panel-body">
        <p className="operation-section-help">Pulsa una plaza ocupada para ver los datos del vehículo, su cliente y el importe acumulado hasta este momento.</p>
        <div className="exit-space-grid">{active.map((operation) => {
          const currentSpace = spaces.find((space) => space.code === operation.space)
          const client = clientFor(operation, vehicles, clients)
          const currentQuote = getQuote(operation)
          const vehicleType = operation.vehicle_type || vehicles.find((item) => item.plate === operation.plate)?.type || 'Auto'
          return <button type="button" className={`exit-space-card ${String(selectedExitId) === String(operation.id) ? 'selected' : ''}`} key={operation.id} onClick={() => selectExit(operation)}>
            <div className="exit-space-card-head"><strong>{operation.space}</strong><span>{currentSpace?.floor || 'Piso 1'}</span></div>
            <div className="exit-space-car"><img src={operation.image_data || vehicles.find((item) => item.plate === operation.plate)?.image_data || vehicleImages[vehicleType] || autoReference} alt={operation.image_data ? `Imagen de ${vehicleType}` : `Fotografía de ${vehicleType}`} /><div><strong>{operation.plate}</strong><span>{operation.vehicle}</span></div></div>
            <div className="exit-space-owner"><i className="bi bi-person" />{client.name}</div>
            <div className="exit-space-estimate"><span>{elapsed(currentQuote.minutes)}</span><strong>{currency(currentQuote.amount)}</strong></div>
          </button>
        })}{active.length === 0 && <div className="empty-state">No hay espacios ocupados en este momento.</div>}</div>

        {selectedExit && <div className="exit-calculation-panel">
          <div className="exit-calculation-title"><div><div className="eyebrow">Cálculo al momento</div><h3>{selectedExit.space} · {selectedExit.plate}</h3></div><button type="button" className="icon-button" aria-label="Cerrar cálculo" onClick={() => setSelectedExitId(null)}><i className="bi bi-x-lg" /></button></div>
          <div className="exit-detail-grid"><div><span>Cliente</span><strong>{exitClient?.name || 'Visitante'}</strong></div><div><span>Vehículo</span><strong>{selectedExit.vehicle} · {selectedExit.vehicle_type || 'Auto'}</strong></div><div><span>Placa / ticket</span><strong>{selectedExit.plate} · {selectedExit.ticket}</strong></div><div><span>Hora de entrada</span><strong>{dateTime(selectedExit.entry_at)}</strong></div><div><span>Tiempo transcurrido</span><strong>{elapsed(getQuote(selectedExit).minutes)}</strong></div><div><span>Tarifa por hora o fracción</span><strong>{currency(hourlyRate)} · {getQuote(selectedExit).billableHours} {getQuote(selectedExit).billableHours === 1 ? 'hora' : 'horas'}</strong></div></div>
          {exitClient?.phone && <div className="exit-client-contact"><i className="bi bi-telephone" />{exitClient.phone}{exitClient.email && <><i className="bi bi-envelope" />{exitClient.email}</>}</div>}
          <div className="exit-payment-row"><label htmlFor="exit-payment-method">Método de pago<select id="exit-payment-method" className="form-select" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option>Efectivo</option><option>QR</option></select></label><div className="exit-total"><span>Total estimado</span><strong>{currency(getQuote(selectedExit).amount)}</strong></div><button type="button" className="btn btn-primary" onClick={handleExit} disabled={busy}><i className="bi bi-receipt" />{busy ? 'Procesando…' : 'Cobrar y generar factura'}</button></div>
        </div>}
        {message && selectedExit && <div className="alert alert-danger py-2 mt-3 mb-0 small">{message}</div>}
      </div>
    </section>

    <section className="panel mt-3"><div className="panel-header"><h2>Historial de movimientos</h2><span>{items.length} registros</span></div><div className="table-wrap"><table className="management-table"><thead><tr><th>TICKET</th><th>PLACA</th><th>CLIENTE</th><th>ESPACIO</th><th>ENTRADA</th><th>SALIDA</th><th>IMPORTE</th><th>ESTADO</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.ticket}</td><td>{item.plate}</td><td>{clientFor(item, vehicles, clients).name}</td><td>{item.space}</td><td>{dateTime(item.entry_at)}</td><td>{item.exit_at ? dateTime(item.exit_at) : '—'}</td><td>{item.amount ? currency(item.amount) : '—'}</td><td><span className={`status-badge ${item.status === 'En curso' ? 'status-current' : 'status-completed'}`}>{item.status}</span></td></tr>)}</tbody></table></div></section>

    {invoice && <div className="modal-backdrop-custom invoice-backdrop" role="presentation"><article className="invoice-paper" role="dialog" aria-modal="true" aria-labelledby="invoice-title">
      <header className="invoice-header"><div className="invoice-brand"><span className="invoice-logo"><i className="bi bi-p-square-fill" /></span><div><strong>Sis Estacionamiento</strong><span>Comprobante de servicio</span></div></div><div className="invoice-number"><span>FACTURA / RECIBO</span><strong>{invoice.payment?.ticket || invoice.operation.ticket}</strong><small>{dateTime(invoice.payment?.paid_at || invoice.operation.exit_at)}</small></div></header>
      <div className="invoice-rule" />
      <h2 id="invoice-title">Factura de estacionamiento</h2>
      <div className="invoice-client"><span>CLIENTE</span><strong>{invoice.client?.name || 'Visitante'}</strong><small>{invoice.client?.phone || 'Sin teléfono'}{invoice.client?.email ? ` · ${invoice.client.email}` : ''}</small></div>
      <div className="invoice-data-grid"><div><span>Ticket</span><strong>{invoice.operation.ticket}</strong></div><div><span>Placa</span><strong>{invoice.operation.plate}</strong></div><div><span>Vehículo</span><strong>{invoice.vehicle || invoice.operation.vehicle}</strong></div><div><span>Espacio</span><strong>{invoice.space || invoice.operation.space}</strong></div><div><span>Entrada</span><strong>{dateTime(invoice.operation.entry_at)}</strong></div><div><span>Salida</span><strong>{dateTime(invoice.operation.exit_at)}</strong></div><div><span>Forma de pago</span><strong>{invoice.payment?.method || paymentMethod}</strong></div><div><span>Tiempo total</span><strong>{elapsed(Math.max(1, Math.ceil((new Date(invoice.operation.exit_at).getTime() - new Date(invoice.operation.entry_at).getTime()) / 60000)))}</strong></div></div>
      <div className="invoice-total-line"><span>Total pagado</span><strong>{currency(invoice.payment?.amount ?? invoice.operation.amount)}</strong></div>
      <div className="invoice-actions"><button type="button" className="btn btn-outline-secondary" onClick={() => setInvoice(null)}>Cerrar</button><button type="button" className="btn btn-primary invoice-print-button" onClick={() => window.print()}><i className="bi bi-printer" />Imprimir factura</button></div>
    </article></div>}
  </>
}