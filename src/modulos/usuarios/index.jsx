import EntityModule from '../../components/EntityModule'
import CreateUser from './create'
import EditUser from './edit'

const fields = [
  { name: 'name', label: 'Nombre completo', required: true, full: true },
  { name: 'email', label: 'Correo electrónico', type: 'email', required: true, full: true },
  { name: 'role', label: 'Rol', type: 'select', required: true, options: [{ value: 'Administrador', label: 'Administrador' }, { value: 'Operador', label: 'Operador' }, { value: 'Cajero', label: 'Cajero' }] },
]

export default function Users({ items, onSave, onToggle, busy }) {
  return <EntityModule title="Usuarios del sistema" description="Administra usuarios internos y su estado de acceso." itemName="usuario" items={items} fields={fields} onSave={onSave} onToggle={onToggle} busy={busy} CreateForm={CreateUser} EditForm={EditUser} columns={[
    { label: 'USUARIO', render: (item) => <span className="record-primary">{item.name}</span> },
    { label: 'CORREO', key: 'email' },
    { label: 'ROL', key: 'role' },
  ]} />
}