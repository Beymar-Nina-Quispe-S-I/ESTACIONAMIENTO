import { useEffect, useState } from 'react'
import Dashboard from './modulos/inicio'
import Clients from './modulos/clientes'
import Vehicles from './modulos/vehiculos'
import Spaces from './modulos/espacios'
import Operations from './modulos/operaciones'
import Cash from './modulos/caja'
import Reports from './modulos/reportes'
import Users from './modulos/usuarios'
import Sidebar from './components/Sidebar'
import adminAvatar from './assets/avatar-admin.jpg'
import { demoData } from './data/demo'
import { apiRequest, loadDashboard } from './services/api'
import './App.css'

const navigation = [
  { id: 'dashboard', label: 'Inicio', icon: 'bi-house-door', group: 'MENÚ' },
  { id: 'operations', label: 'Entradas y salidas', icon: 'bi-arrow-left-right', group: 'OPERACIÓN', badge: 'live' },
  { id: 'spaces', label: 'Espacios', icon: 'bi-p-square', group: 'GESTIÓN' },
  { id: 'clients', label: 'Clientes', icon: 'bi-people', group: 'GESTIÓN' },
  { id: 'vehicles', label: 'Vehículos', icon: 'bi-car-front', group: 'GESTIÓN' },
  { id: 'users', label: 'Usuarios', icon: 'bi-person-gear', group: 'GESTIÓN' },
  { id: 'cash', label: 'Caja', icon: 'bi-cash-coin', group: 'GESTIÓN' },
  { id: 'reports', label: 'Reportes', icon: 'bi-file-earmark-pdf', group: 'ANÁLISIS' },
]

function App() {
  const [section, setSection] = useState('dashboard')
  const [data, setData] = useState(demoData)
  const [apiOnline, setApiOnline] = useState(false)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    let active = true
    const refreshDashboard = () => loadDashboard()
      .then((result) => {
        if (!active) return
        setData((current) => ({ ...current, ...result }))
        setApiOnline(true)
      })
      .catch(() => {
        if (active) setApiOnline(false)
      })
    refreshDashboard()
    const interval = window.setInterval(refreshDashboard, 10000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 3500)
    return () => window.clearTimeout(timer)
  }, [notice])

  const saveRecord = async (resource, record, id) => {
    const endpoint = id ? `/${resource}/${id}` : `/${resource}`
    setBusy(true)
    try {
      const saved = await apiRequest(endpoint, { method: id ? 'PUT' : 'POST', body: record })
      setData((current) => ({ ...current, [resource]: id
        ? current[resource].map((item) => item.id === id ? saved : item)
        : [saved, ...current[resource]] }))
      setApiOnline(true)
      setNotice(id ? 'Registro actualizado correctamente.' : 'Registro creado correctamente.')
      return saved
    } catch (error) {
      if (apiOnline) throw new Error(error.message, { cause: error })
      const localRecord = { ...record, id: id ?? Date.now(), active: record.active ?? true }
      setData((current) => ({ ...current, [resource]: id
        ? current[resource].map((item) => item.id === id ? { ...item, ...localRecord } : item)
        : [localRecord, ...current[resource]] }))
      setNotice('Guardado en modo demostración. Conecta PostgreSQL para persistir los cambios.')
      return localRecord
    } finally {
      setBusy(false)
    }
  }

  const toggleRecord = async (resource, item) => {
    try {
      const updated = await apiRequest(`/${resource}/${item.id}/status`, {
        method: 'PATCH', body: { active: !item.active },
      })
      setData((current) => ({ ...current, [resource]: current[resource].map((row) => row.id === item.id ? updated : row) }))
      setApiOnline(true)
      setNotice(updated.active ? 'Registro activado.' : 'Registro desactivado; se conserva en el historial.')
    } catch (error) {
      if (apiOnline) throw new Error(error.message, { cause: error })
      setData((current) => ({ ...current, [resource]: current[resource].map((row) => row.id === item.id ? { ...row, active: !row.active } : row) }))
      setNotice('Estado actualizado en modo demostración.')
    }
  }

  const registerEntry = async (vehicleId, spaceId) => {
    const vehicle = data.vehicles.find((item) => Number(item.id) === Number(vehicleId))
    const space = data.spaces.find((item) => Number(item.id) === Number(spaceId))
    if (!vehicle || !space) throw new Error('Selecciona un vehículo y un espacio disponibles.')
    if (apiOnline) {
      const result = await apiRequest('/operations/assign', { method: 'POST', body: { space_id: space.id, vehicle_id: vehicle.id } })
      setData((current) => ({ ...current, operations: [result.operation, ...current.operations], spaces: current.spaces.map((item) => item.id === result.space.id ? result.space : item) }))
      return result.operation
    }
    if (!space.active || space.status !== 'Disponible') throw new Error('El espacio ya no está disponible.')
    if (data.operations.some((item) => item.plate === vehicle.plate && item.status === 'En curso')) throw new Error('Este vehículo ya tiene una entrada activa.')
    const client = data.clients.find((item) => Number(item.id) === Number(vehicle.client_id))
    const operation = { id: Date.now(), ticket: `TK-${Date.now().toString().slice(-6)}`, plate: vehicle.plate, vehicle: vehicle.description, vehicle_type: vehicle.type, owner: client?.name || vehicle.owner || 'Visitante', client: client ? { id: client.id, name: client.name, phone: client.phone, email: client.email } : null, space: space.code, entry_at: new Date().toISOString(), status: 'En curso' }
    setData((current) => ({ ...current, operations: [operation, ...current.operations], spaces: current.spaces.map((item) => item.id === space.id ? { ...item, status: 'Ocupado' } : item) }))
    return operation
  }

  const assignSpace = async (space, vehicle) => {
    if (apiOnline) {
      const result = await apiRequest('/operations/assign', { method: 'POST', body: { space_id: space.id, vehicle_id: vehicle.id } })
      setData((current) => ({ ...current, operations: [result.operation, ...current.operations], spaces: current.spaces.map((item) => item.id === result.space.id ? result.space : item) }))
      setNotice(`${vehicle.plate} asignado a ${space.code}.`)
      return result
    }
    const currentSpace = data.spaces.find((item) => item.id === space.id)
    if (!currentSpace || currentSpace.status !== 'Disponible') throw new Error('El espacio ya no está disponible.')
    if (data.operations.some((item) => item.plate === vehicle.plate && item.status === 'En curso')) throw new Error('Este vehículo ya tiene una entrada activa.')
    const client = data.clients.find((item) => Number(item.id) === Number(vehicle.client_id))
    const operation = { id: Date.now(), ticket: `TK-${Date.now().toString().slice(-6)}`, plate: vehicle.plate, vehicle: vehicle.description, vehicle_type: vehicle.type, owner: client?.name || vehicle.owner || 'Visitante', client: client ? { id: client.id, name: client.name, phone: client.phone, email: client.email } : null, space: space.code, entry_at: new Date().toISOString(), status: 'En curso' }
    setData((current) => ({ ...current, operations: [operation, ...current.operations], spaces: current.spaces.map((item) => item.id === space.id ? { ...item, status: 'Ocupado' } : item) }))
    setNotice(`${vehicle.plate} asignado a ${space.code}.`)
    return operation
  }

  const saveSpaceRecord = async (record, id) => {
    if (!id && record.status === 'Ocupado') throw new Error('Para ocupar este espacio, registra una entrada y asigna un vehículo.')
    const currentSpace = data.spaces.find((space) => Number(space.id) === Number(id))
    const activeOperation = currentSpace && data.operations.find((operation) => operation.space === currentSpace.code && operation.status === 'En curso')
    if (activeOperation && record.status !== 'Ocupado') throw new Error('Este espacio tiene un vehículo en curso. Registra su salida antes de cambiar el estado.')
    if (activeOperation && record.code.toUpperCase() !== currentSpace.code.toUpperCase()) throw new Error('No se puede cambiar el código de un espacio ocupado.')
    if (!activeOperation && record.status === 'Ocupado') throw new Error('Para ocupar este espacio, registra una entrada y asigna un vehículo.')
    return saveRecord('spaces', record, id)
  }

  const registerExit = async (ticket, method = 'Efectivo') => {
    if (apiOnline) {
      const result = await apiRequest(`/operations/exit/${encodeURIComponent(ticket)}`, { method: 'POST', body: { method } })
      setData((current) => ({ ...current, operations: current.operations.map((item) => item.id === result.operation.id ? result.operation : item), payments: [result.payment, ...current.payments], spaces: current.spaces.map((item) => item.id === result.space.id ? result.space : item) }))
      return result
    }
    const operation = data.operations.find((item) => item.status === 'En curso' && (item.ticket === ticket || item.plate.toLowerCase() === ticket.toLowerCase()))
    if (!operation) throw new Error('No se encontró una operación activa con ese ticket o placa.')
    const amount = Math.max(5, Math.ceil((Date.now() - new Date(operation.entry_at).getTime()) / 3600000) * 5)
    const paidAt = new Date().toISOString()
    const completedOperation = { ...operation, status: 'Finalizado', exit_at: paidAt, amount }
    const payment = { id: Date.now(), ticket: operation.ticket, plate: operation.plate, amount, method, paid_at: paidAt }
    setData((current) => ({ ...current, operations: current.operations.map((item) => item.id === operation.id ? completedOperation : item), payments: [payment, ...current.payments], spaces: current.spaces.map((item) => item.code === operation.space ? { ...item, status: 'Disponible' } : item) }))
    return { operation: completedOperation, payment }
  }

  const registerPayment = async (payment) => {
    try {
      const saved = await apiRequest('/cash', { method: 'POST', body: payment })
      setData((current) => ({ ...current, payments: [saved, ...current.payments] }))
      setApiOnline(true)
      setNotice('Pago registrado en caja.')
    } catch (error) {
      if (apiOnline) throw error
      setData((current) => ({ ...current, payments: [{ ...payment, id: Date.now(), paid_at: new Date().toISOString() }, ...current.payments] }))
      setNotice('Pago registrado en modo demostración.')
    }
  }

  const exportReport = async (kind) => {
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF()
    const rows = kind === 'Caja' ? data.payments : data.operations
    pdf.setFontSize(18)
    pdf.text('PARKLY / ESTACIONAMIENTO', 14, 18)
    pdf.setFontSize(13)
    pdf.text(`Reporte de ${kind.toLowerCase()}`, 14, 29)
    pdf.setFontSize(9)
    pdf.text(`Generado: ${new Date().toLocaleString('es')}`, 14, 36)
    const columns = kind === 'Caja'
      ? [{ label: 'Fecha', x: 14 }, { label: 'Ticket', x: 46 }, { label: 'Placa', x: 88 }, { label: 'Método', x: 122 }, { label: 'Importe', x: 163 }]
      : [{ label: 'Ticket', x: 14 }, { label: 'Placa', x: 48 }, { label: 'Espacio', x: 83 }, { label: 'Entrada', x: 112 }, { label: 'Estado', x: 165 }]
    const printHeader = (y) => {
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      columns.forEach((column) => pdf.text(column.label, column.x, y))
      pdf.setFont('helvetica', 'normal')
    }
    let cursor = 49
    printHeader(cursor)
    cursor += 8
    pdf.setFontSize(8)
    rows.forEach((row) => {
      if (cursor > 278) {
        pdf.addPage()
        pdf.setFontSize(12)
        pdf.text(`Reporte de ${kind.toLowerCase()} (continuación)`, 14, 18)
        cursor = 29
        printHeader(cursor)
        cursor += 8
        pdf.setFontSize(8)
      }
      const values = kind === 'Caja'
        ? [new Date(row.paid_at).toLocaleDateString('es-MX'), row.ticket || 'Manual', row.plate || '—', row.method, `$${Number(row.amount).toFixed(2)}`]
        : [row.ticket, row.plate, row.space, new Date(row.entry_at).toLocaleString('es-MX'), row.status]
      values.forEach((value, index) => pdf.text(String(value).slice(0, 22), columns[index].x, cursor))
      cursor += 7
    })
    pdf.save(`parkly-reporte-${kind.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  const currentPage = {
    dashboard: <Dashboard data={data} onNavigate={setSection} />,
    clients: <Clients items={data.clients} vehicles={data.vehicles} onSave={(record, id) => saveRecord('clients', record, id)} onSaveVehicle={(record) => saveRecord('vehicles', record)} onToggle={(item) => toggleRecord('clients', item)} busy={busy} />,
    vehicles: <Vehicles items={data.vehicles} clients={data.clients} onSave={(record, id) => saveRecord('vehicles', record, id)} onToggle={(item) => toggleRecord('vehicles', item)} busy={busy} />,
    users: <Users items={data.users} onSave={(record, id) => saveRecord('users', record, id)} onToggle={(item) => toggleRecord('users', item)} busy={busy} />,
    spaces: <Spaces items={data.spaces} vehicles={data.vehicles} operations={data.operations} onSave={saveSpaceRecord} onToggle={(item) => toggleRecord('spaces', item)} onAssign={assignSpace} onNavigate={setSection} busy={busy} />,
    operations: <Operations items={data.operations} spaces={data.spaces} vehicles={data.vehicles} clients={data.clients} hourlyRate={data.hourly_rate || 5} onEntry={registerEntry} onExit={registerExit} />,
    cash: <Cash items={data.payments} vehicles={data.vehicles} operations={data.operations} clients={data.clients} onPayment={registerPayment} />,
    reports: <Reports data={data} onExport={exportReport} />,
  }[section]
  const activeNav = navigation.find((item) => item.id === section)

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar navigation={navigation} active={section} onNavigate={setSection} />
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-branding">
            <button type="button" className="sidebar-toggle" aria-label="Contraer menú" title="Contraer menú" onClick={() => setSidebarCollapsed((current) => !current)}><i className="bi bi-list" /></button>
            <strong>Sis Estacionamiento</strong>
          </div>
          <div className="topbar-right">
            <span className={`connection-pill ${apiOnline ? 'connected' : ''}`}><span />{apiOnline ? 'Base de datos conectada' : 'Modo demostración'}</span>
            <div className="user-chip"><span className="user-avatar"><img src={adminAvatar} alt="Avatar de administrador" /></span><span><b>Admin Central</b><small>Administrador</small></span><i className="bi bi-chevron-down" /></div>
          </div>
        </header>
        {!apiOnline && <div className="demo-notice"><i className="bi bi-info-circle" /> API sin conexión: estás viendo datos de demostración. Inicia el servidor y configura PostgreSQL para guardar cambios.</div>}
        <div className="page-content">
          <div className="content-breadcrumb"><span>Panel principal</span><i className="bi bi-chevron-right" /><strong>{activeNav?.label}</strong></div>
          {currentPage}
        </div>
      </main>
      {notice && <div className="toast-message"><i className="bi bi-check-circle-fill" />{notice}<button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setNotice('')} /></div>}
    </div>
  )
}

export default App
