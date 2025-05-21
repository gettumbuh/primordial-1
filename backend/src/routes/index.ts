import { Router } from 'express'
import usersRouter from './users'
import mintRouter from './mint'
import sellRouter from './sell'
import transferRouter from './transfer'
const router = Router()

router.use('/users', usersRouter)
router.use('/mint', mintRouter)
router.use('/sell', sellRouter)
router.use('/transfer', transferRouter)

export default router
