import { useState } from 'react'
import EntityModule from '../../components/EntityModule'
import EntityForm from '../../components/EntityForm'
import autoReference from '../../assets/vehiculos/auto-referencia.jpg'
import camionetaReference from '../../assets/vehiculos/camioneta-referencia.jpg'
import motoReference from '../../assets/vehiculos/moto-referencia.jpg'
import CreateClient from './create'
import EditClient from './edit'

const vehicleImages = { Auto: autoReference, Moto: motoReference, Camioneta: camionetaReference }
const fields = [
  { name: 'name', label: 'Nombre completo / razón social', required: true, full: true },
  { name: 'phone', label: 'Teléfono', required: true, type: 'tel' },
  { name: 'email', label: 'Correo electrónico', type: 'email' },
  { name: 'agreement', label: 'Convenio / referencia', full: true },
  { name: 'monthly_rate', label: 'Mensualidad ($)', type: 'number', min: 0, step: '0.01' },
  { name: 'monthly_until', label: 'Vigencia hasta', type: 'date' },
]

const vehicleFields = [
  { name: 'plate', label: 'Placa', required: true },
  { name: 'type', label: 'Tipo de vehículo', type: 'select', required: true, options: [{ value: 'Auto', label: 'Auto' }, { value: 'Moto', label: 'Moto' }, { value: 'Camioneta', label: 'Camioneta' }] },
  { name: 'brand', label: 'Marca', required: true },
  { name: 'model', label: 'Modelo', required: true },
  { name: 'color', label: 'Color' },
  { name: 'image_data', label: 'Imagen del vehículo', type: 'file', accept: 'image/*', maxSize: 600 * 1024, hint: 'Auto, moto o camioneta · máximo 600 KB', full: true },
]

export default function Clients({ items, vehicles, onSave, onSaveVehicle, onToggle, busy }) {
  const [selectedClient, setSelectedClient] = useState(null)
  const [vehicleFormOpen, setVehicleFormOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const clientVehicles = vehicles.filter((vehicle) => Number(vehicle.client_id) === Number(selectedClient?.id))

  return <>
    <EntityModule title="Clientes" description="Administra contactos, convenios y mensualidades de clientes habituales." itemName="cliente" items={items} fields={fields} onSave={onSave} onToggle={onToggle} busy={busy} columns={[
    { label: 'CLIENTE', render: (item) => <><span className="record-primary">{item.name}</span><span className="record-secondary">{item.email || 'Sin correo registrado'}</span></> },
    { label: 'TELÉFONO', key: 'phone' },
    { label: 'CONVENIO', render: (item) => item.agreement || '—' },
    { label: 'MENSUALIDAD', render: (item) => item.monthly_rate ? `$${Number(item.monthly_rate).toLocaleString('es-MX')}` : 'Sin convenio' },
    { label: 'VIGENCIA', render: (item) => item.monthly_until ? new Date(`${item.monthly_until}T12:00:00`).toLocaleDateString('es-MX') : '—' },
  ]} CreateForm={CreateClient} EditForm={EditClient} renderExtraAction={(client) => <button type="button" className="icon-button" title="Datos y vehículos del cliente" aria-label={`Vehículos de ${client.name}`} onClick={() => { setSelectedClient(client); setVehicleFormOpen(false); setFeedback('') }}><i className="bi bi-car-front" /></button>} />
    {selectedClient && <div className="modal-backdrop-custom" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelectedClient(null)}><section className="form-dialog client-details-dialog" role="dialog" aria-modal="true" aria-labelledby="client-details-title">
      <header className="dialog-head"><div><div className="eyebrow">Expediente del cliente</div><h2 id="client-details-title">{selectedClient.name}</h2></div><button type="button" aria-label="Cerrar" onClick={() => setSelectedClient(null)}><i className="bi bi-x-lg" /></button></header>
      <div className="dialog-body">
        <div className="client-detail-grid"><div><span>Teléfono</span><strong>{selectedClient.phone || '—'}</strong></div><div><span>Correo</span><strong>{selectedClient.email || '—'}</strong></div><div><span>Convenio</span><strong>{selectedClient.agreement || 'Sin convenio'}</strong></div><div><span>Mensualidad</span><strong>{selectedClient.monthly_rate ? `$${Number(selectedClient.monthly_rate).toLocaleString('es-MX')}` : '—'}</strong></div></div>
        <div className="client-vehicles-heading"><div><h3>Vehículos vinculados</h3><span>{clientVehicles.length} registrados</span></div><button type="button" className="btn btn-primary" onClick={() => { setFeedback(''); setVehicleFormOpen(true) }}><i className="bi bi-plus-lg" />Registrar vehículo</button></div>
        <div className="client-vehicles-list">{clientVehicles.map((vehicle) => <div className="client-vehicle-row" key={vehicle.id}><img className="client-vehicle-photo" src={vehicle.image_data || vehicleImages[vehicle.type] || autoReference} alt={`Vehículo ${vehicle.plate}`} /><div><strong>{vehicle.plate}</strong><span>{vehicle.brand} {vehicle.model} · {vehicle.color || 'Color no indicado'}</span></div><span className="vehicle-type-tag">{vehicle.type}</span></div>)}{clientVehicles.length === 0 && <div className="empty-state"><i className="bi bi-car-front" />Este cliente aún no tiene vehículos.</div>}</div>
        {feedback && <div className="alert alert-danger py-2 mt-3 mb-0 small">{feedback}</div>}
        <div className="form-actions"><button type="button" className="btn btn-outline-secondary" onClick={() => setSelectedClient(null)}>Cerrar</button></div>
      </div>
    </section></div>}
    {vehicleFormOpen && selectedClient && <EntityForm title={`Vehículo de ${selectedClient.name}`} fields={vehicleFields} busy={busy} onCancel={() => setVehicleFormOpen(false)} onSubmit={(record) => Promise.resolve(onSaveVehicle({ ...record, client_id: selectedClient.id })).then(() => setVehicleFormOpen(false)).catch((error) => { setFeedback(error.message); setVehicleFormOpen(false) })} />}
  </>
}