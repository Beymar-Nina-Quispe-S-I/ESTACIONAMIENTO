import { useState } from 'react'
import autoReference from '../../assets/vehiculos/auto-referencia.jpg'
import camionetaReference from '../../assets/vehiculos/camioneta-referencia.jpg'
import motoReference from '../../assets/vehiculos/moto-referencia.jpg'
import CreateVehicle from './create'
import EditVehicle from './edit'

const vehicleImages = { Auto: autoReference, Moto: motoReference, Camioneta: camionetaReference }
const baseFields = [
  { name: 'plate', label: 'Placa', required: true },
  { name: 'type', label: 'Tipo de vehículo', type: 'select', required: true, options: [{ value: 'Auto', label: 'Auto' }, { value: 'Moto', label: 'Moto' }, { value: 'Camioneta', label: 'Camioneta' }] },
  { name: 'brand', label: 'Marca', required: true },
  { name: 'model', label: 'Modelo', required: true },
  { name: 'color', label: 'Color' },
  { name: 'image_data', label: 'Imagen del vehículo', type: 'file', accept: 'image/*', maxSize: 600 * 1024, hint: 'Auto, moto o camioneta · máximo 600 KB', full: true },
]

export default function Vehicles({ items, clients, onSave, onToggle, busy }) {
  const [query, setQuery] = useState('')
  const [formMode, setFormMode] = useState(null)
  const fields = [...baseFields, { name: 'client_id', label: 'Propietario (opcional)', type: 'select', options: [{ value: '', label: 'Visitante / sin cliente' }, ...clients.filter((client) => client.active).map((client) => ({ value: String(client.id), label: client.name }))] }]
  const visibleVehicles = items.filter((vehicle) => Object.values(vehicle).some((value) => String(value ?? '').toLowerCase().includes(query.toLowerCase())))
  const Form = formMode?.item ? EditVehicle : CreateVehicle

  return <>
    <div className="page-heading"><div><div className="eyebrow">Catálogo vehicular</div><h1>Vehículos</h1><p>Placas registradas, tipo y cliente propietario.</p></div><button type="button" className="btn btn-primary" onClick={() => setFormMode({})}><i className="bi bi-plus-lg" />Registrar vehículo</button></div>
    <div className="vehicle-toolbar"><div className="search-box"><i className="bi bi-search" /><input aria-label="Buscar vehículos" placeholder="Buscar por placa, marca o cliente..." value={query} onChange={(event) => setQuery(event.target.value)} /></div><span className="table-count">{visibleVehicles.length} vehículos · {items.filter((item) => item.active).length} activos</span></div>
    <div className="vehicle-grid">{visibleVehicles.map((vehicle) => <article className={`vehicle-card ${vehicle.active ? '' : 'vehicle-inactive'}`} key={vehicle.id}><div className="vehicle-card-top"><span className="vehicle-type-tag">{vehicle.type}</span><span className={`space-state ${vehicle.active ? 'state-free' : 'state-maintenance'}`}>{vehicle.active ? 'Activo' : 'Inactivo'}</span></div><div className="vehicle-card-image"><img src={vehicle.image_data || vehicleImages[vehicle.type] || autoReference} alt={vehicle.image_data ? `Imagen de ${vehicle.type.toLowerCase()}` : `Fotografía de ${vehicle.type.toLowerCase()}`} /></div><div className="vehicle-card-info"><strong>{vehicle.plate}</strong><span>{vehicle.brand} {vehicle.model} · {vehicle.color || 'Color no indicado'}</span><small>{vehicle.owner || clients.find((client) => Number(client.id) === Number(vehicle.client_id))?.name || 'Visitante'}</small></div><div className="vehicle-card-actions"><button type="button" className="icon-button" title="Editar vehículo" aria-label={`Editar ${vehicle.plate}`} onClick={() => setFormMode({ item: vehicle })}><i className="bi bi-pencil" /></button><button type="button" className="icon-button" title={vehicle.active ? 'Desactivar vehículo' : 'Activar vehículo'} aria-label={vehicle.active ? 'Desactivar vehículo' : 'Activar vehículo'} onClick={() => onToggle(vehicle)}><i className={`bi ${vehicle.active ? 'bi-toggle-on' : 'bi-toggle-off'}`} /></button></div></article>)}</div>
    {visibleVehicles.length === 0 && <div className="empty-state"><i className="bi bi-car-front" />No hay vehículos que coincidan con la búsqueda.</div>}
    {formMode && <Form fields={fields} initial={formMode.item} busy={busy} onCancel={() => setFormMode(null)} onSubmit={(record) => Promise.resolve(onSave({ ...record, client_id: record.client_id || null }, formMode.item?.id)).then(() => setFormMode(null)).catch(() => {})} />}
  </>
}