import { Router } from 'express'
import { extractUSDCFromAddress, sendUSDCToAddress } from '../walletService'
import {
  asyncHandler,
  verifyApiSecret,
  validateRequest,
} from '../middleware/global'
import Joi from 'joi'
import prisma from '../prisma'

const transferRouter = Router()

transferRouter.post(
  '/out',
  verifyApiSecret,
  validateRequest(
    Joi.object({
      twitterHandle: Joi.string().required(),
      amount: Joi.string().required(),
      recipientAddress: Joi.string().required(),
    })
  ),
  asyncHandler(async (req, res) => {
    const { twitterHandle, amount, recipientAddress } = req.body

    const user = await prisma.primordialUsers.findFirst({
      where: {
        twitterHandle,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const txHash = await extractUSDCFromAddress(
      user.privateKey,
      amount,
      recipientAddress
    )

    res.json({ txHash })
  })
)

transferRouter.post(
  '/in',
  verifyApiSecret,
  validateRequest(
    Joi.object({
      twitterHandle: Joi.string().required(),
      amount: Joi.string().required(),
    })
  ),
  asyncHandler(async (req, res) => {
    const { twitterHandle, amount } = req.body

    const user = await prisma.primordialUsers.findFirst({
      where: {
        twitterHandle,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const txHash = await sendUSDCToAddress(amount, user.address)

    res.json({ txHash })
  })
)
export default transferRouter
