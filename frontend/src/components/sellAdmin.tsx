'use client'

import { useCallback, useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_SERVER_HOST

export default function SellAdmin() {
  const [price, setPrice] = useState('')
  const [twitterHandle, setTwitterHandle] = useState('')
  const [isSettingPrice, setIsSettingPrice] = useState(false)
  const [isSettingTwitterHandle, setIsSettingTwitterHandle] = useState(false)
  const [nonce, setNonce] = useState('')
  const [apiSecret, setApiSecret] = useState<string | null>(null)

  const [outTwitterHandle, setOutTwitterHandle] = useState('')
  const [outAmount, setOutAmount] = useState('')
  const [outRecipientAddress, setOutRecipientAddress] = useState('')
  const [isOutProcessing, setIsOutProcessing] = useState(false)

  const [isSendProcessing, setIsSendProcessing] = useState(false)

  const handleGetNonce = useCallback(async (apiSecret: string) => {
    const response = await axios.get(`${API_URL}/sell/nonce`, {
      headers: {
        Authorization: `Bearer ${apiSecret}`,
      },
    })
    setNonce(response.data.nonce)
  }, [])

  const handleUpdateNonce = useCallback(async (apiSecret: string | null) => {
    if (!apiSecret) return
    const response = await axios.post(
      `${API_URL}/sell/nonce`,
      {},
      {
        headers: {
          Authorization: `Bearer ${apiSecret}`,
        },
      }
    )
    setNonce(response.data.nonce)
  }, [])

  useEffect(() => {
    const API_SECRET = localStorage.getItem('primordialApiSecret')
    if (API_SECRET) {
      setApiSecret(API_SECRET)
      handleGetNonce(API_SECRET)
    }
  }, [handleGetNonce])

  const handleSetCurrentPrice = useCallback(async () => {
    if (isSettingPrice) return
    if (!apiSecret) return
    if (!price) return

    const priceInNumber = Number(price)
    if (isNaN(priceInNumber)) return

    try {
      setIsSettingPrice(true)
      const response = await axios.post(
        `${API_URL}/sell/price`,
        {
          price: priceInNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${apiSecret}`,
          },
        }
      )

      console.log('response', response.data)

      setPrice('')
      setIsSettingPrice(false)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSettingPrice(false)
    }
  }, [price, apiSecret, isSettingPrice])

  const handleSetTwitterHandle = useCallback(async () => {
    if (isSettingTwitterHandle) return
    if (!apiSecret) return
    if (!twitterHandle) return

    try {
      setIsSettingTwitterHandle(true)
      const response = await axios.post(
        `${API_URL}/sell/handle`,
        {
          handle: twitterHandle,
        },
        {
          headers: {
            Authorization: `Bearer ${apiSecret}`,
          },
        }
      )

      console.log('response', response.data)

      setIsSettingTwitterHandle(false)
      setTwitterHandle('')
    } catch (error) {
      console.error(error)
    } finally {
      setIsSettingTwitterHandle(false)
    }
  }, [twitterHandle, apiSecret, isSettingTwitterHandle])

  const handleSend = useCallback(async () => {
    if (isSendProcessing) return
    if (!apiSecret) return
    if (!outTwitterHandle || !outAmount) return

    try {
      setIsSendProcessing(true)
      const response = await axios.post(
        `${API_URL}/transfer/in`,
        {
          twitterHandle: outTwitterHandle,
          amount: outAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${apiSecret}`,
          },
        }
      )

      console.log('response', response.data)

      setIsSendProcessing(false)
      setOutTwitterHandle('')
      setOutAmount('')
      setOutRecipientAddress('')
    } catch (error) {
      console.error('error', error)
      setIsSendProcessing(false)
    }
  }, [outTwitterHandle, outAmount, apiSecret, isSendProcessing])

  const handleExtract = useCallback(async () => {
    if (isOutProcessing) return
    if (!apiSecret) return
    if (!outTwitterHandle || !outAmount || !outRecipientAddress) return

    try {
      setIsOutProcessing(true)
      const response = await axios.post(
        `${API_URL}/transfer/out`,
        {
          twitterHandle: outTwitterHandle,
          amount: outAmount,
          recipientAddress: outRecipientAddress,
        },
        {
          headers: {
            Authorization: `Bearer ${apiSecret}`,
          },
        }
      )

      console.log('response', response.data)

      setIsOutProcessing(false)
      setOutTwitterHandle('')
      setOutAmount('')
      setOutRecipientAddress('')
    } catch (error) {
      console.error('error', error)
      setIsOutProcessing(false)
    }
  }, [
    outTwitterHandle,
    outAmount,
    outRecipientAddress,
    apiSecret,
    isOutProcessing,
  ])

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex gap-2">
        <div className="w-32 h-32 flex flex-col bg-gray-100/10 rounded-sm p-2 text-white">
          <p className="text-sm text-center mb-1">Current Price</p>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="bg-gray-100/20 rounded-sm mx-auto my-auto min-w-full max-w-0 w-full py-1 h-full text-center"
          />
          <Button
            disabled={isSettingPrice}
            className="w-full max-w-md mt-2 bg-pink-800 hover:bg-pink-900"
            onClick={handleSetCurrentPrice}
          >
            {isSettingPrice ? 'Setting...' : 'Set'}
          </Button>
        </div>

        <div className="w-32 h-32 flex flex-col bg-gray-100/10 rounded-sm p-2 text-white">
          <p className="text-sm text-center mb-1">Current Nonce</p>
          <p className="text-2xl font-bold text-center my-auto">{nonce}</p>

          <Button
            className="w-full max-w-md mt-2 bg-pink-800 hover:bg-pink-900"
            onClick={() => handleUpdateNonce(apiSecret)}
          >
            Update Nonce
          </Button>
        </div>
      </div>

      <div className="w-full max-w-md mt-4">
        <Input
          value={twitterHandle}
          onChange={(e) => setTwitterHandle(e.target.value)}
          placeholder="Twitter Handle"
          className="w-full max-w-md bg-white text-black"
        />
        <Button
          disabled={isSettingTwitterHandle}
          className="w-full max-w-md mt-2 bg-pink-800 hover:bg-pink-900"
          onClick={handleSetTwitterHandle}
        >
          {isSettingTwitterHandle ? 'Setting...' : 'Set'}
        </Button>
      </div>

      <div className="w-full max-w-md mt-4">
        <div className="flex gap-2">
          <Input
            value={outTwitterHandle}
            onChange={(e) => setOutTwitterHandle(e.target.value)}
            placeholder="Twitter Handle"
            className="w-full max-w-md bg-white text-black"
          />
          <Input
            value={outAmount}
            onChange={(e) => setOutAmount(e.target.value)}
            placeholder="Amount"
            className="w-full max-w-md bg-white text-black"
          />
          <Input
            value={outRecipientAddress}
            onChange={(e) => setOutRecipientAddress(e.target.value)}
            placeholder="Recipient Address"
            className="w-full max-w-md bg-white text-black"
          />
        </div>
        <div className="flex gap-2">
          <Button
            disabled={isOutProcessing}
            className="flex-1 max-w-md mt-2 bg-pink-800 hover:bg-pink-900"
            onClick={handleExtract}
          >
            {isOutProcessing ? 'Processing...' : 'Extract'}
          </Button>
          <Button
            disabled={isSendProcessing}
            className="flex-1 max-w-md mt-2 bg-pink-800 hover:bg-pink-900"
            onClick={handleSend}
          >
            {isSendProcessing ? 'Processing...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  )
}
