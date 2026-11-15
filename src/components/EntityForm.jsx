import { useState } from 'react'

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'))
    reader.readAsDataURL(file)
  })
}

export default function EntityForm({ title, fields, initial = {}, busy, errorMessage, onCancel, onSubmit }) {
  const [imagePreview, setImagePreview] = useState(initial.image_data || '')
  const [fileError, setFileError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const record = Object.fromEntries(formData.entries())
    fields.forEach((field) => {
      if (field.type === 'number' && record[field.name] !== '') record[field.name] = Number(record[field.name])
      if (field.type === 'select' && field.options?.some((option) => option.value === '')) record[field.name] = record[field.name] || null
    })
    try {
      for (const field of fields.filter((item) => item.type === 'file')) {
        const file = formData.get(field.name)
        if (file instanceof File && file.size > 0) {
          if (!file.type.startsWith('image/')) throw new Error('Selecciona un archivo de imagen válido.')
          if (field.maxSize && file.size > field.maxSize) throw new Error(`La imagen debe pesar menos de ${Math.round(field.maxSize / 1024)} KB.`)
          record[field.name] = await readImage(file)
        }
        else if (initial[field.name]) record[field.name] = initial[field.name]
        else delete record[field.name]
      }
      setFileError('')
      onSubmit(record)
    } catch (error) {
      setFileError(error.message)
    }
  }

  return (
    <div className="modal-backdrop-custom" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <section className="form-dialog" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <header className="dialog-head"><h2 id="form-title">{title}</h2><button type="button" aria-label="Cerrar" onClick={onCancel}><i className="bi bi-x-lg" /></button></header>
        <form className="dialog-body" onSubmit={submit}>
          <div className="form-grid">
            {fields.map((field) => (
              <div className={`form-field ${field.full ? 'full' : ''}`} key={field.name}>
                <label htmlFor={`field-${field.name}`}>{field.label}{field.required && ' *'}</label>
                {field.type === 'select' ? (
                  <select className="form-select" id={`field-${field.name}`} name={field.name} defaultValue={initial[field.name] ?? field.defaultValue ?? ''} required={field.required}>
                    {field.options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
                  </select>
                ) : field.type === 'file' ? (
                  <>
                    <input className="form-control" id={`field-${field.name}`} name={field.name} type="file" accept={field.accept || 'image/*'} onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (!file) return
                      if (!file.type.startsWith('image/')) return setFileError('Selecciona un archivo de imagen válido.')
                      if (field.maxSize && file.size > field.maxSize) return setFileError(`La imagen debe pesar menos de ${Math.round(field.maxSize / 1024)} KB.`)
                      setFileError('')
                      readImage(file).then(setImagePreview).catch((error) => setFileError(error.message))
                    }} />
                    <small className="form-field-hint">{field.hint || 'Selecciona una imagen desde tu dispositivo.'}</small>
                    {imagePreview && <img className="upload-preview" src={imagePreview} alt="Vista previa del vehículo" />}
                  </>
                ) : (
                  <input className="form-control" id={`field-${field.name}`} name={field.name} type={field.type || 'text'} defaultValue={initial[field.name] ?? ''} placeholder={field.placeholder || ''} min={field.min} max={field.max} step={field.step} required={field.required} />
                )}
              </div>
            ))}
          </div>
          {fileError && <div className="alert alert-danger py-2 mt-3 mb-0 small">{fileError}</div>}
          {errorMessage && <div className="alert alert-danger py-2 mt-3 mb-0 small">{errorMessage}</div>}
          <div className="form-actions"><button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Cancelar</button><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button></div>
        </form>
      </section>
    </div>
  )
}