'use client'

import { useCallback, useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_SERVER_HOST

export default function Sell() {
  const [currentPrice, setCurrentPrice] = useState('')

  const [twitterHandle, setTwitterHandle] = useState('')
  const [nonce, setNonce] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const allowSell = currentPrice && currentPrice !== '0' && twitterHandle && nonce

  const handleGetCurrentPrice = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/sell`)
      setCurrentPrice(response.data.price)
    } catch (error) {
      console.error(error)
    }
  }, [])
  
  const handleSell = useCallback(async () => {
    if (!twitterHandle) return
    if (!nonce) return

    try {
      setIsLoading(true)
      setErrorMessage(null)
      setSuccessMessage(null)
      
      const response = await axios.post(`${API_URL}/sell`, {
        twitterHandle,
        nonce,
      })

      const { success, reason, amount, txnHash } = response.data
      if (!success) {
        setErrorMessage(reason)
        setSuccessMessage('')
        return
      }

      const explorerLink = `https://scrollscan.com/tx/${txnHash}`
      toast.custom(
        (id) => {
          return (
            <div className="bg-white text-black p-2 text-sm rounded-sm flex flex-col gap-2 min-w-[300px]">
              <p>
                You wallet has been credited with {amount} USDC.&nbsp;
                <a
                  href={explorerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500"
                >
                  View Transaction
                </a>
              </p>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.dismiss(id)}
                >
                  Close
                </Button>
              </div>
            </div>
          )
        },
        {
          dismissible: true,
          duration: Infinity,
        }
      )

      setSuccessMessage(`Mint Successful. ${reason}`)
      setErrorMessage('')
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [twitterHandle, nonce])

  useEffect(() => {
    handleGetCurrentPrice()
  }, [handleGetCurrentPrice])

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex gap-2">
        <div className="w-32 h-32 flex flex-col bg-gray-100/10 rounded-sm p-2 text-white">
          <p className="text-sm text-center mb-1">Current Price</p>
          <p className="text-2xl font-bold text-center my-auto">${currentPrice}</p>
        </div>
      </div>

      <div className="w-full max-w-md mt-4">
        <Input
          value={twitterHandle}
          onChange={(e) => setTwitterHandle(e.target.value)}
          placeholder="Twitter Handle"
          className="w-full max-w-md bg-white text-black"
        />
        <Input
          value={nonce}
          onChange={(e) => setNonce(e.target.value)}
          placeholder="Nonce"
          className="w-full max-w-md mt-2 bg-white text-black"
        />
        <Button
          disabled={!allowSell}
          className="w-full max-w-md mt-2 bg-pink-800 hover:bg-pink-900"
          onClick={handleSell}
        >
          {isLoading ? 'Selling...' : 'Sell'}
        </Button>
      </div>

      <div className="w-full max-w-md mt-4">
        <p
          className={`text-sm text-center ${
            errorMessage || successMessage ? 'text-red-300' : 'text-green-300'
          }`}
        >
          {errorMessage || successMessage}
        </p>
      </div>
    </div>
  )
}
