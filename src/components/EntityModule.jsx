import { useState } from 'react'

export default function EntityModule({ title, description, itemName, items, columns, fields, onSave, onToggle, busy, CreateForm, EditForm, formProps = {}, renderExtraAction }) {
  const [query, setQuery] = useState('')
  const [formMode, setFormMode] = useState(null)
  const filtered = items.filter((item) => Object.values(item).some((value) => String(value ?? '').toLowerCase().includes(query.toLowerCase())))
  const Form = formMode?.item ? EditForm : CreateForm

  return (
    <>
      <div className="page-heading">
        <div><div className="eyebrow">Administración</div><h1>{title}</h1><p>{description}</p></div>
        <button type="button" className="btn btn-primary" onClick={() => setFormMode({})}><i className="bi bi-plus-lg" />Nuevo {itemName}</button>
      </div>
      <section className="panel">
        <div className="module-tools">
          <div className="search-box"><i className="bi bi-search" /><input aria-label={`Buscar ${title.toLowerCase()}`} placeholder="Buscar por nombre, código o dato…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
          <span className="table-count">{filtered.length} registros · {items.filter((item) => item.active).length} activos</span>
        </div>
        <div className="table-wrap">
          <table className="management-table"><thead><tr>{columns.map((column) => <th key={column.label}>{column.label}</th>)}<th>ESTADO</th><th aria-label="Acciones" /></tr></thead>
            <tbody>{filtered.map((item) => (
              <tr key={item.id}>{columns.map((column) => <td key={column.label}>{column.render ? column.render(item) : item[column.key]}</td>)}
                <td><span className={`status-badge ${item.active ? 'status-active' : 'status-inactive'}`}>{item.active ? 'Activo' : 'Inactivo'}</span></td>
                <td><div className="row-actions">{renderExtraAction?.(item)}<button type="button" className="icon-button" title="Editar" aria-label="Editar" onClick={() => setFormMode({ item, Edit: formMode?.Edit })}><i className="bi bi-pencil" /></button><button type="button" className={`icon-button ${item.active ? 'danger' : ''}`} title={item.active ? 'Desactivar' : 'Activar'} aria-label={item.active ? 'Desactivar' : 'Activar'} onClick={() => onToggle(item)}><i className={`bi ${item.active ? 'bi-person-slash' : 'bi-person-check'}`} /></button></div></td>
              </tr>
            ))}</tbody>
          </table>
          {filtered.length === 0 && <div className="empty-state"><i className="bi bi-inbox" />No hay registros para mostrar.</div>}
        </div>
      </section>
      {formMode && Form && <Form {...formProps} fields={fields} initial={formMode.item} busy={busy} onCancel={() => setFormMode(null)} onSubmit={(record) => { Promise.resolve(onSave(record, formMode.item?.id)).then(() => setFormMode(null)).catch(() => {}) }} />}
    </>
  )
}