const money = (amount) => `$${Number(amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function Stat({ icon, label, value, note }) {
  return <article className="stat-card"><div className="stat-head"><span>{label}</span><span className="stat-icon"><i className={`bi ${icon}`} /></span></div><div className="stat-value">{value}</div><div className="stat-foot">{note}</div></article>
}

export default function Dashboard({ data, onNavigate }) {
  const activeSpaces = data.spaces.filter((space) => space.active)
  const occupied = activeSpaces.filter((space) => space.status === 'Ocupado').length
  const activeOperations = data.operations.filter((operation) => operation.status === 'En curso')
  const revenue = data.payments.filter((payment) => new Date(payment.paid_at).toDateString() === new Date().toDateString()).reduce((sum, payment) => sum + Number(payment.amount), 0)
  const ratio = activeSpaces.length ? Math.round((occupied / activeSpaces.length) * 100) : 0
  const dateLabel = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return <>
    <div className="page-heading"><div><div className="eyebrow">{dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}</div><h1>Resumen operativo</h1><p>Indicadores y actividad actual de tu estacionamiento.</p></div><button type="button" className="btn btn-outline-secondary" onClick={() => onNavigate('operations')}><i className="bi bi-arrow-left-right" />Registrar movimiento</button></div>
    <div className="stat-grid">
      <Stat icon="bi-p-square" label="Espacios ocupados" value={`${occupied} / ${activeSpaces.length}`} note={<><span className="positive">{ratio}%</span> de ocupación actual</>} />
      <Stat icon="bi-car-front" label="Vehículos en curso" value={activeOperations.length} note="Tickets abiertos en este momento" />
      <Stat icon="bi-cash-stack" label="Ingresos de hoy" value={money(revenue)} note="Pagos registrados en caja" />
      <Stat icon="bi-people" label="Clientes activos" value={data.clients.filter((client) => client.active).length} note="Con acceso vigente al sistema" />
    </div>
    <div className="dashboard-grid">
      <section className="panel">
        <div className="panel-header"><h2>Ocupación del estacionamiento</h2><span>{activeSpaces.length} espacios activos</span></div>
        <div className="panel-body">
          <div className="occupancy-summary"><div><div className="occupancy-number">{ratio}% <small>ocupado</small></div><div className="occupancy-note">Estado actualizado al momento</div></div><span className="status-badge status-active">Operativo</span></div>
          <div className="progress" role="progressbar" aria-label="Porcentaje de ocupación" aria-valuenow={ratio} aria-valuemin="0" aria-valuemax="100"><div className="progress-bar" style={{ width: `${ratio}%` }} /></div>
          <div className="space-legend"><span><i className="legend-dot" />Ocupado {occupied}</span><span><i className="legend-dot free" />Disponible {activeSpaces.filter((item) => item.status === 'Disponible').length}</span><span><i className="legend-dot service" />Mantenimiento {activeSpaces.filter((item) => item.status === 'Mantenimiento').length}</span></div>
          <div className="space-list">{activeSpaces.slice(0, 15).map((space) => <div key={space.id} className={`space-tile ${space.status === 'Ocupado' ? 'occupied' : space.status === 'Mantenimiento' ? 'maintenance' : ''}`}><b>{space.code}</b><span>{space.status}</span></div>)}</div>
        </div>
      </section>
      <section className="panel">
        <div className="panel-header"><h2>Últimos movimientos</h2><button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => onNavigate('operations')}>Ver todos</button></div>
        <div className="panel-body"><div className="activity-timeline">{data.operations.slice(0, 5).map((item) => <div className="timeline-row" key={item.id}><span className="timeline-dot" /><div className="timeline-content"><b>{item.plate} · {item.status}</b><small>{item.ticket} · {item.space} · {new Date(item.entry_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</small></div></div>)}{data.operations.length === 0 && <div className="empty-state">Aún no hay movimientos.</div>}</div></div>
      </section>
      <section className="panel" style={{ gridColumn: '1 / -1' }}>
        <div className="panel-header"><h2>Vehículos dentro</h2><span>{activeOperations.length} tickets activos</span></div>
        <div className="table-wrap"><table className="activity-table"><thead><tr><th>TICKET</th><th>PLACA</th><th>VEHÍCULO</th><th>ESPACIO</th><th>INGRESO</th><th>ESTADO</th></tr></thead><tbody>{activeOperations.slice(0, 5).map((item) => <tr key={item.id}><td>{item.ticket}</td><td>{item.plate}</td><td>{item.vehicle || 'Visitante'}</td><td>{item.space}</td><td>{new Date(item.entry_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</td><td><span className="status-badge status-current">En curso</span></td></tr>)}</tbody></table>{activeOperations.length === 0 && <div className="empty-state">No hay vehículos en el estacionamiento.</div>}</div>
      </section>
    </div>
  </>
}