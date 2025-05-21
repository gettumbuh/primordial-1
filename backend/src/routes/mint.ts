import { Router, Request, Response } from 'express'
import {
  asyncHandler,
  uploadImage,
  validateRequest,
} from '../middleware/global'
import Joi from 'joi'
import prisma from '../prisma'
import { config } from '../config'
import OpenAI from 'openai'
import fs from 'fs'
import { getWaterBalance, mintToAddress } from '../walletService'

const mintRouter = Router()

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
})

const getImageDescription = async (imagePath: string, mimetype: string) => {
  const imageBuffer = fs.readFileSync(imagePath)
  const base64Image = imageBuffer.toString('base64')
  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this image and identify if there is a water source present. Water sources include but are not limited to: faucets/taps, water dispensers, drinking fountains, water coolers, bottled water, water pitchers, water filters, or any equipment that delivers water. Be thorough in your examination of the entire image.',
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimetype};base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'identifyWaterSource',
          description:
            'Identify if a water source is present in the image and provide details about it',
          parameters: {
            type: 'object',
            properties: {
              hasWaterSource: {
                type: 'boolean',
                description:
                  'Whether the image contains any type of water source or water delivery system',
              },
              reasoning: {
                type: 'string',
                description:
                  'Detailed explanation for why the object was identified as a water source or why no water source was detected, including visual characteristics that informed the decision',
              },
            },
            required: ['hasWaterSource', 'reasoning'],
          },
        },
      },
    ],
    tool_choice: {
      type: 'function',
      function: { name: 'identifyWaterSource' },
    },
    temperature: 0.2,
    max_tokens: 500,
  })

  const result = response.choices[0].message
  return result
}

mintRouter.post(
  '/',
  uploadImage,
  validateRequest(
    Joi.object({
      twitterHandle: Joi.string().required(),
    })
  ),
  asyncHandler(async (req: Request, res: Response) => {
    const { twitterHandle } = req.body
    const { file } = req
    if (!file) {
      return res.status(400).json({
        success: false,
        reason: 'No image file uploaded',
        amount: 0,
        txnHash: null,
      })
    }

    const users = await prisma.primordialUsers.findMany({
      where: {
        twitterHandle: twitterHandle,
      },
    })
    const user = users[0]
    if (!user) {
      return res.status(200).json({
        success: false,
        reason: 'User not found',
        amount: 0,
        txnHash: null,
      })
    }

    const waterBalance = await getWaterBalance(user.address)
    if (Number(waterBalance) > 5) {
      return res.status(200).json({
        success: false,
        reason: 'You already have enough water in your wallet',
        amount: 0,
        txnHash: null,
      })
    }

    const mintCheckResult = await getImageDescription(file.path, file.mimetype)
    if (
      !mintCheckResult ||
      !mintCheckResult.tool_calls ||
      !mintCheckResult.tool_calls[0] ||
      !mintCheckResult.tool_calls[0].function.arguments
    ) {
      return res.status(200).json({
        success: false,
        reason: 'No result from OpenAI',
        amount: 0,
        txnHash: null,
      })
    }

    const toolCall = mintCheckResult.tool_calls[0]
    let { hasWaterSource, reasoning } = JSON.parse(
      toolCall.function.arguments
    )

    let txnHash = null
    if (hasWaterSource) {
      try {
        txnHash = await mintToAddress(user.address, '1')
      } catch (error) {
        console.error(error)
        reasoning = 'Mint failed: ' + (error as Error).message
      }
    }

    res.status(200).json({
      success: hasWaterSource,
      reason: reasoning,
      amount: hasWaterSource ? 1 : 0,
      txnHash: txnHash,
    })
  })
)

export default mintRouter
