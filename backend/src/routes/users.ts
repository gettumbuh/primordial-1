import { Router, Request, Response } from 'express'
import prisma from '../prisma'
import {
  asyncHandler,
  validateRequest,
  verifyApiSecret,
} from '../middleware/global'
import Joi from 'joi'
import { ethers } from 'ethers'
import crypto from 'crypto'
import { config } from '../config'

const usersRouter = Router()

usersRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const users = await prisma.primordialUsers.findMany({
      select: {
        twitterHandle: true,
        twitterId: true,
        address: true,
        privateKey: false,
      },
    })
    res.json({ success: true, users })
  })
)

usersRouter.post(
  '/',
  verifyApiSecret,
  validateRequest(
    Joi.object({
      users: Joi.array().items(
        Joi.object({
          twitterHandle: Joi.string().required(),
          twitterId: Joi.string().required(),
        })
      ),
    })
  ),
  asyncHandler(async (req: Request, res: Response) => {
    const users = req.body.users as {
      twitterHandle: string
      twitterId: string
    }[]
    const foundUsers = await prisma.primordialUsers.findMany({
      where: { twitterId: { in: users.map((user) => user.twitterId) } },
    })
    const newUsers = users.filter(
      (user) =>
        !foundUsers.some((foundUser) => foundUser.twitterId === user.twitterId)
    )

    for (const user of newUsers) {
      const hash = crypto
        .createHash('sha256')
        .update(user.twitterId + config.walletGenSecret)
        .digest('hex')

      const privateKey = `0x${hash}`
      const wallet = new ethers.Wallet(privateKey)
      await prisma.primordialUsers.create({
        data: {
          twitterHandle: user.twitterHandle,
          twitterId: user.twitterId,
          address: wallet.address,
          privateKey: wallet.privateKey,
        },
      })
    }

    const allUsers = await prisma.primordialUsers.findMany({
      select: {
        twitterHandle: true,
        twitterId: true,
        address: true,
        privateKey: false,
      },
    })
    res.json({ success: true, users: allUsers })
  })
)

usersRouter.delete(
  '/:twitterId',
  verifyApiSecret,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.primordialUsers.delete({
      where: { twitterId: req.params.twitterId },
    })
    res.json(user)
  })
)

export default usersRouter
