import { Router } from 'express'
import usersRouter from './users'
import mintRouter from './mint'
const router = Router()

router.use('/users', usersRouter)
router.use('/mint', mintRouter)

export default router