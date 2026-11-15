export default function Sidebar({ navigation, active, onNavigate }) {
  const groups = [...new Set(navigation.map((item) => item.group))]

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark"><i className="bi bi-car-front-fill" /></span>
        <span className="brand-name"><b>Sis</b> Estacionamiento<small>CONTROL DE ESTACIONAMIENTO</small></span>
      </div>
      <div className="nav-groups">
        {groups.map((group) => (
          <div className="nav-group" key={group}>
            <div className="nav-label">{group}</div>
            {navigation.filter((item) => item.group === group).map((item) => (
              <button type="button" className={`side-link ${active === item.id ? 'active' : ''}`} key={item.id} title={item.label} onClick={() => onNavigate(item.id)}>
                <i className={`bi ${item.icon}`} /><span>{item.label}</span>{item.badge && <span className="nav-live" />}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="sidebar-bottom">
        <div className="parking-status"><i className="bi bi-building" /><span><b>Central · Sucursal 01</b><span>Operativo</span></span></div>
        v1.0.0 · Sistema de estacionamiento
      </div>
    </aside>
  )
}