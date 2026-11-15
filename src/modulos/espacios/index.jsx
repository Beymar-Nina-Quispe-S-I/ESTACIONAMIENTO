import { useState } from 'react'
import autoReference from '../../assets/vehiculos/auto-referencia.jpg'
import camionetaReference from '../../assets/vehiculos/camioneta-referencia.jpg'
import motoReference from '../../assets/vehiculos/moto-referencia.jpg'
import CreateSpace from './create'
import EditSpace from './edit'

const vehicleImages = { Auto: autoReference, Moto: motoReference, Camioneta: camionetaReference }
const fields = [
  { name: 'code', label: 'Código de espacio', required: true },
  { name: 'floor', label: 'Piso', required: true, defaultValue: 'Piso 1' },
  { name: 'sector', label: 'Sector', required: true },
  { name: 'type', label: 'Tipo', type: 'select', required: true, options: [{ value: 'General', label: 'General' }, { value: 'Accesible', label: 'Accesible' }, { value: 'Moto', label: 'Moto' }] },
  { name: 'status', label: 'Estado', type: 'select', required: true, defaultValue: 'Disponible', options: [{ value: 'Disponible', label: 'Disponible' }, { value: 'Ocupado', label: 'Ocupado (asignar vehículo)' }, { value: 'Mantenimiento', label: 'En mantenimiento' }] },
]

export default function Spaces({ items, vehicles, operations, onSave, onToggle, onAssign, onNavigate, busy }) {
  const [formMode, setFormMode] = useState(null)
  const [selectedSpace, setSelectedSpace] = useState(null)
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const activeVehicles = vehicles.filter((vehicle) => vehicle.active)
  const openSpace = (space) => {
    setSelectedSpace(space)
    setSelectedVehicleId('')
    setFeedback('')
  }
  const submitAssignment = async (event) => {
    event.preventDefault()
    const vehicle = activeVehicles.find((item) => String(item.id) === selectedVehicleId)
    if (!vehicle) return setFeedback('Selecciona un vehículo registrado.')
    setSaving(true)
    setFeedback('')
    try {
      await onAssign(selectedSpace, vehicle)
      setSelectedSpace(null)
    } catch (error) {
      setFeedback(error.message)
    } finally {
      setSaving(false)
    }
  }
  const submitSpace = async (record) => {
    setFormError('')
    try {
      const currentStatus = formMode.item?.status || 'Disponible'
      await onSave({ ...record, status: record.status || currentStatus }, formMode.item?.id)
      setFormMode(null)
    } catch (error) {
      setFormError(error.message)
    }
  }

  return <>
    <div className="page-heading">
      <div><div className="eyebrow">Control del estacionamiento</div><h1>Espacios</h1><p>Selecciona una plaza para consultar su estado o asignar un vehículo.</p></div>
      <button type="button" className="btn btn-primary" onClick={() => { setFormError(''); setFormMode({}) }}><i className="bi bi-plus-lg" />Registrar espacio</button>
    </div>
    <div className="space-toolbar"><span><i className="bi bi-building" /> Piso 1 <i className="bi bi-chevron-down" /></span><div className="space-key"><span><i className="key-dot free" />Disponible</span><span><i className="key-dot occupied" />Ocupado</span><span><i className="key-dot maintenance" />Mantenimiento</span></div></div>
    <div className="parking-grid">{items.filter((space) => space.active).map((space) => {
      const currentOperation = operations.find((operation) => operation.space === space.code && operation.status === 'En curso')
      const vehicle = vehicles.find((item) => item.plate === currentOperation?.plate)
      const type = currentOperation?.vehicle_type || vehicle?.type || 'Auto'
      const occupied = space.status === 'Ocupado' && currentOperation
      return <article className={`parking-space ${occupied ? 'is-occupied' : ''} ${space.status === 'Mantenimiento' ? 'is-maintenance' : ''}`} key={space.id}>
        <button type="button" className="parking-space-main" onClick={() => openSpace(space)} aria-label={`${space.code}, ${space.status}${occupied ? `, placa ${currentOperation.plate}` : ''}`}>
          <div className="space-card-head"><span className="space-code">{space.code}</span><span className={`space-state ${occupied ? 'state-occupied' : space.status === 'Mantenimiento' ? 'state-maintenance' : 'state-free'}`}>{occupied ? 'Ocupado' : space.status}</span></div>
          <div className="space-card-art">{occupied ? <img src={currentOperation.image_data || vehicle?.image_data || vehicleImages[type] || autoReference} alt={currentOperation.image_data || vehicle?.image_data ? `Imagen de ${type}` : `Fotografía de ${type}`} /> : <span className="parking-symbol">P</span>}</div>
          {occupied ? <div className="space-car-info"><strong>{currentOperation.plate}</strong><span>{currentOperation.vehicle || vehicle?.description || type}</span><small>{vehicle?.owner || 'Visitante'}</small></div> : <div className="space-car-info"><strong>{space.status === 'Mantenimiento' ? 'Fuera de servicio' : 'Plaza libre'}</strong><span>{space.floor} · Sector {space.sector}</span><small>{space.type}</small></div>}
        </button>
        <div className="space-card-actions"><button type="button" className="icon-button" title="Editar espacio y estado" aria-label={`Editar ${space.code}`} onClick={() => { setFormError(''); setFormMode({ item: space }) }}><i className="bi bi-pencil" /></button><button type="button" className="icon-button danger" title="Desactivar espacio" aria-label={`Desactivar ${space.code}`} onClick={() => onToggle(space)}><i className="bi bi-toggle-on" /></button></div>
      </article>
    })}</div>
    {items.some((space) => !space.active) && <section className="inactive-spaces"><h2>Espacios desactivados</h2><div>{items.filter((space) => !space.active).map((space) => <button type="button" className="inactive-space" key={space.id} onClick={() => onToggle(space)}><i className="bi bi-toggle-off" />{space.code}<span>Activar</span></button>)}</div></section>}
    {formMode && (formMode.item ? <EditSpace fields={fields} initial={formMode.item} busy={busy} errorMessage={formError} onCancel={() => setFormMode(null)} onSubmit={submitSpace} /> : <CreateSpace fields={fields} busy={busy} errorMessage={formError} onCancel={() => setFormMode(null)} onSubmit={submitSpace} />)}
    {selectedSpace && <div className="modal-backdrop-custom" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelectedSpace(null)}><section className="form-dialog space-dialog" role="dialog" aria-modal="true" aria-labelledby="space-modal-title">
      <header className="dialog-head"><div><div className="eyebrow">{selectedSpace.floor} · Sector {selectedSpace.sector}</div><h2 id="space-modal-title">{selectedSpace.status === 'Disponible' ? 'Registrar espacio' : `Espacio ${selectedSpace.code}`}</h2></div><button type="button" aria-label="Cerrar" onClick={() => setSelectedSpace(null)}><i className="bi bi-x-lg" /></button></header>
      {selectedSpace.status === 'Disponible' ? <form className="dialog-body" onSubmit={submitAssignment}><div className="assign-space-intro"><span className="parking-symbol">P</span><div><strong>{selectedSpace.code}</strong><small>Espacio disponible · {selectedSpace.type}</small></div></div><div className="form-field"><label htmlFor="assign-vehicle">Vehículo registrado</label><select className="form-select" id="assign-vehicle" value={selectedVehicleId} onChange={(event) => setSelectedVehicleId(event.target.value)} required><option value="">Seleccionar placa y cliente...</option>{activeVehicles.map((vehicle) => <option value={vehicle.id} key={vehicle.id}>{vehicle.plate} · {vehicle.brand} {vehicle.model} · {vehicle.owner || 'Visitante'}</option>)}</select></div>{activeVehicles.length === 0 && <p className="assign-hint">No hay vehículos activos. Registra primero un vehículo en el módulo Vehículos.</p>}{feedback && <div className="alert alert-danger py-2 mt-3 mb-0 small">{feedback}</div>}<div className="form-actions"><button type="button" className="btn btn-outline-secondary" onClick={() => setSelectedSpace(null)}>Cancelar</button><button type="submit" className="btn btn-primary" disabled={saving || activeVehicles.length === 0}>{saving ? 'Asignando…' : 'Asignar vehículo'}</button></div></form> : <div className="dialog-body">{selectedSpace.status === 'Ocupado' ? (() => { const operation = operations.find((item) => item.space === selectedSpace.code && item.status === 'En curso'); const vehicle = vehicles.find((item) => item.plate === operation?.plate); const type = operation?.vehicle_type || vehicle?.type || 'Auto'; return <div className="occupied-detail"><img src={operation?.image_data || vehicle?.image_data || vehicleImages[type] || autoReference} alt={operation?.image_data || vehicle?.image_data ? `Imagen de ${type}` : `Fotografía de ${type}`} /><div><span className="eyebrow">VEHÍCULO EN PLAZA</span><strong>{operation?.plate || 'Placa no disponible'}</strong><span>{operation?.vehicle || vehicle?.description || type}</span><small>{vehicle?.owner || 'Visitante'} · Ticket {operation?.ticket || '—'}</small></div></div> })() : <div className="assign-space-intro"><i className="bi bi-tools" /><div><strong>En mantenimiento</strong><small>Este espacio no acepta asignaciones.</small></div></div>}<div className="form-actions"><button type="button" className="btn btn-outline-secondary" onClick={() => setSelectedSpace(null)}>Cerrar</button>{selectedSpace.status === 'Ocupado' && <button type="button" className="btn btn-primary" onClick={() => { setSelectedSpace(null); onNavigate('operations') }}>Ir a entradas y salidas</button>}</div></div>}
    </section></div>}
  </>
}