import { Router } from 'express'
import * as clients from '../controllers/clients.controller.js'
import * as vehicles from '../controllers/vehicles.controller.js'
import * as spaces from '../controllers/spaces.controller.js'
import * as operations from '../controllers/operations.controller.js'
import * as cash from '../controllers/cash.controller.js'
import * as users from '../controllers/users.controller.js'
import { getDashboard } from '../controllers/dashboard.controller.js'

const router = Router()

router.get('/dashboard', getDashboard)
router.get('/users', users.listUsers)
router.post('/users', users.createUser)
router.put('/users/:id', users.updateUser)
router.patch('/users/:id/status', users.setUserStatus)
router.get('/clients', clients.listClients)
router.post('/clients', clients.createClient)
router.put('/clients/:id', clients.updateClient)
router.patch('/clients/:id/status', clients.setClientStatus)
router.get('/vehicles', vehicles.listVehicles)
router.post('/vehicles', vehicles.createVehicle)
router.put('/vehicles/:id', vehicles.updateVehicle)
router.patch('/vehicles/:id/status', vehicles.setVehicleStatus)
router.get('/spaces', spaces.listSpaces)
router.post('/spaces', spaces.createSpace)
router.put('/spaces/:id', spaces.updateSpace)
router.patch('/spaces/:id/status', spaces.setSpaceStatus)
router.get('/operations', operations.listOperations)
router.post('/operations/entry', operations.registerEntry)
router.post('/operations/assign', operations.assignVehicleToSpace)
router.post('/operations/exit/:ticket', operations.registerExit)
router.get('/cash', cash.listPayments)
router.post('/cash', cash.createPayment)

export default router