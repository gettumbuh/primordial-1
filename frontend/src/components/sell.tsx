'use client'

import { useCallback, useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios'
import { toast } from 'sonner'
import { DialogDescription, DialogTitle } from './ui/dialog'
import { DialogHeader } from './ui/dialog'
import { DialogContent } from './ui/dialog'
import { Dialog } from './ui/dialog'

const API_URL = process.env.NEXT_PUBLIC_SERVER_HOST

export default function Sell() {
  const [currentPrice, setCurrentPrice] = useState('')

  const [twitterHandle, setTwitterHandle] = useState('')
  const [nonce, setNonce] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [openDialog, setOpenDialog] = useState(false)
  const [updatedNonce, setUpdatedNonce] = useState('')
  const [checked, setChecked] = useState(false)

  const allowSell =
    currentPrice && currentPrice !== '0' && twitterHandle && nonce

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

      const { success, reason, amount, txnHash, updatedNonce } = response.data
      if (!success) {
        setErrorMessage(reason)
        setSuccessMessage('')
        return
      }

      localStorage.setItem('primordial-updated-nonce', updatedNonce)
      setOpenDialog(true)
      setUpdatedNonce(updatedNonce)

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

  useEffect(() => {
    const updatedNonce = localStorage.getItem('primordial-updated-nonce')
    if (updatedNonce) {
      setUpdatedNonce(updatedNonce)
      setOpenDialog(true)
    }
  }, [])

  return (
    <>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="flex gap-2">
          <div className="w-32 h-32 flex flex-col bg-gray-100/10 rounded-sm p-2 text-white">
            <p className="text-sm text-center mb-1">Current Price</p>
            <p className="text-2xl font-bold text-center my-auto">
              ${currentPrice}
            </p>
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
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent
          disableClose={true}
          onInteractOutside={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          className="p-4"
        >
          <DialogHeader>
            <DialogTitle>Important: Complete Your Action</DialogTitle>
            <DialogDescription className="flex flex-col gap-2">
              <div className="text-sm mt-4">
                In order to complete your action, you have been given a new
                nonce. Please write this new nonce in the NFC tag on the plant.
                This will allow you and others to continue selling water to
                Primordial.
              </div>
              <div className="text-sm">
                Failing to do so in the future will result in complete loss of
                your entire stake and may cause the death of the plant.
              </div>

              <div className="mt-4 mx-auto text-center text-2xl font-bold bg-gray-300 rounded-sm p-2 text-black">
                {updatedNonce}
              </div>

              <div className="flex gap-2 mt-4">
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-1"
                  onChange={(e) => setChecked(e.target.checked)}
                />
                <div>
                  I have updated the nonce on the plant and understand that
                  failure to do so will result in complete loss my stake.
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  disabled={!checked}
                  onClick={() => {
                    localStorage.removeItem('primordial-updated-nonce')
                    setOpenDialog(false)
                    setChecked(false)
                    setUpdatedNonce('')
                  }}
                >
                  Close
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}
