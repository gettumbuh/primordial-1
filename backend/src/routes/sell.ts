import { Router } from 'express'
import prisma from '../prisma'
import {
  verifyApiSecret,
  validateRequest,
  asyncHandler,
} from '../middleware/global'
import Joi from 'joi'
import { buyFromAddress } from '../walletService'

const sellRouter = Router()

sellRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const sale = await prisma.sale.findUnique({
      where: { id: 'primordial-1' },
    })

    return res.status(200).json({
      price: sale?.currentPrice,
      approvedHandle: sale?.approvedHandle,
    })
  })
)

sellRouter.post(
  '/',
  validateRequest(
    Joi.object({
      twitterHandle: Joi.string().required(),
      nonce: Joi.string().required(),
    })
  ),
  asyncHandler(async (req, res) => {
    const { twitterHandle, nonce } = req.body

    const sale = await prisma.sale.findUnique({
      where: { id: 'primordial-1' },
    })

    if (!sale || sale.currentPrice <= 0) {
      return res.status(200).json({
        success: false,
        txnHash: null,
        amount: 0,
        reason: 'Primordial is not looking to buy water at this time',
      })
    }

    if (!sale.approvedHandle) {
      return res.status(200).json({
        success: false,
        txnHash: null,
        amount: 0,
        reason: 'Primordial has not approved a seller yet',
      })
    }

    const user = await prisma.primordialUsers.findFirst({
      where: {
        twitterHandle: sale.approvedHandle,
      },
    })

    if (!user) {
      return res.status(200).json({
        success: false,
        txnHash: null,
        amount: 0,
        reason: 'User with this handle has does not have a wallet',
      })
    }

    if (sale.approvedHandle !== twitterHandle) {
      return res.status(200).json({
        success: false,
        txnHash: null,
        amount: 0,
        reason:
          'You have not been approved by Primordial. If the current seller does not complete the transaction, the next commenter will be approved.',
      })
    }

    if (sale.nonce !== nonce) {
      return res.status(200).json({
        success: false,
        txnHash: null,
        amount: 0,
        reason: 'Invalid nonce',
      })
    }

    const amount = sale.currentPrice
    let txnHash = null

    try {
      txnHash = await buyFromAddress(user.privateKey, '1', amount.toString())
      if (!txnHash) throw new Error('Transaction failed')
    } catch (error) {
      console.log(error)
      return res.status(200).json({
        success: false,
        txnHash: null,
        amount: 0,
        reason: 'Transaction failed',
      })
    }

    const updatedNonce = Math.floor(100000 + Math.random() * 900000).toString()

    await prisma.sale.update({
      where: { id: 'primordial-1' },
      data: {
        currentPrice: 0,
        approvedHandle: null,
        nonce: updatedNonce,
      },
    })

    return res.status(200).json({
      success: true,
      txnHash,
      amount,
      reason: 'Transaction successful',
      updatedNonce: nonce,
    })
  })
)

sellRouter.post(
  '/price',
  verifyApiSecret,
  validateRequest(
    Joi.object({
      price: Joi.number().required(),
    })
  ),
  asyncHandler(async (req, res) => {
    const { price } = req.body

    let sale = await prisma.sale.findUnique({
      where: {
        id: 'primordial-1',
      },
    })

    if (!sale) {
      const otp = Math.floor(100000 + Math.random() * 900000)
      await prisma.sale.create({
        data: {
          id: 'primordial-1',
          currentPrice: price,
          nonce: otp.toString(),
        },
      })
      return res.status(200).json({ message: 'Price set' })
    }

    await prisma.sale.update({
      where: {
        id: 'primordial-1',
      },
      data: {
        currentPrice: price,
      },
    })

    return res.status(200).json({ message: 'Price set' })
  })
)

sellRouter.post(
  '/handle',
  verifyApiSecret,
  validateRequest(
    Joi.object({
      handle: Joi.string().required(),
    })
  ),
  asyncHandler(async (req, res) => {
    const { handle } = req.body

    const user = await prisma.primordialUsers.findFirst({
      where: {
        twitterHandle: handle,
      },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await prisma.sale.update({
      where: { id: 'primordial-1' },
      data: { approvedHandle: handle },
    })

    return res.status(200).json({ message: 'Handle set' })
  })
)

sellRouter.get(
  '/nonce',
  verifyApiSecret,
  asyncHandler(async (req, res) => {
    const sale = await prisma.sale.findUnique({
      where: { id: 'primordial-1' },
    })

    return res.status(200).json({ nonce: sale?.nonce })
  })
)

sellRouter.post(
  '/nonce',
  verifyApiSecret,
  asyncHandler(async (req, res) => {
    const updatedNonce = Math.floor(100000 + Math.random() * 900000).toString()

    await prisma.sale.update({
      where: { id: 'primordial-1' },
      data: { nonce: updatedNonce },
    })

    return res.status(200).json({ nonce: updatedNonce })
  })
)

export default sellRouter
