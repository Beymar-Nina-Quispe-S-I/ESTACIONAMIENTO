import express from 'express'
import api from './routes/index.js'

const app = express()

app.use(express.json({ limit: '1mb' }))
app.get('/api/health', (_request, response) => response.json({ status: 'ok' }))
app.use('/api', api)
app.use((error, _request, response, next) => {
  if (response.headersSent) return next(error)
  console.error(error)
  if (error.code === '23505') return response.status(409).json({ error: 'Ya existe un registro con ese dato único.' })
  if (error.code === '23503') return response.status(400).json({ error: 'La relación indicada no existe o está siendo utilizada.' })
  if (error.code === '23514' || error.code === '22P02') return response.status(400).json({ error: 'Revisa los datos ingresados.' })
  response.status(500).json({ error: 'Error interno del servidor.' })
})

export default app