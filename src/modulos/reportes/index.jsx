const currency = (amount) => `$${Number(amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function Reports({ data, onExport }) {
  const revenue = data.payments.reduce((sum, item) => sum + Number(item.amount), 0)
  const completed = data.operations.filter((item) => item.status === 'Finalizado').length

  return <>
    <div className="page-heading"><div><div className="eyebrow">Análisis</div><h1>Reportes</h1><p>Descarga reportes de movimientos y caja en formato PDF.</p></div></div>
    <div className="report-grid">
      <section className="panel report-card"><span className="report-icon"><i className="bi bi-file-earmark-pdf" /></span><h2>Entradas y salidas</h2><p>Tickets, placas, espacios, horarios y estado de cada movimiento.</p><div className="report-meta"><span>{data.operations.length} movimientos</span><button type="button" className="btn btn-outline-secondary" onClick={() => onExport('Operaciones')}><i className="bi bi-download" />Descargar PDF</button></div></section>
      <section className="panel report-card"><span className="report-icon"><i className="bi bi-file-earmark-bar-graph" /></span><h2>Ingresos de caja</h2><p>Transacciones, método de pago, tickets e importes registrados.</p><div className="report-meta"><span>{data.payments.length} pagos · {currency(revenue)}</span><button type="button" className="btn btn-outline-secondary" onClick={() => onExport('Caja')}><i className="bi bi-download" />Descargar PDF</button></div></section>
    </div>
    <section className="panel mt-3"><div className="panel-header"><h2>Indicadores del sistema</h2><span>Acumulado registrado</span></div><div className="panel-body"><div className="row g-3"><div className="col-sm-4"><div className="eyebrow">Clientes activos</div><strong>{data.clients.filter((item) => item.active).length}</strong></div><div className="col-sm-4"><div className="eyebrow">Vehículos registrados</div><strong>{data.vehicles.filter((item) => item.active).length}</strong></div><div className="col-sm-4"><div className="eyebrow">Operaciones finalizadas</div><strong>{completed}</strong></div></div></div></section>
  </>
}