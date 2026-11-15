import 'dotenv/config'
import process from 'node:process'
import app from './app.js'

const port = Number(process.env.PORT || 3000)

app.listen(port, () => {
  console.log(`API de Parkly disponible en http://localhost:${port}/api`)
})