'use client'
import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_SERVER_HOST

export default function Mint() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [twitterHandle, setTwitterHandle] = useState('')

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const isValid = true // imageFile && twitterHandle

  const handleMint = useCallback(async () => {
    if (!imageFile) return
    try {
      setIsLoading(true)
      setErrorMessage(null)
      setSuccessMessage(null)
      const formData = new FormData()
      formData.append('imageFile', imageFile)
      formData.append('twitterHandle', twitterHandle)
      const response = await axios.post(`${API_URL}/mint`, formData)

      const { success, reason, amount: mintedAmount, txnHash } = response.data
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
                Successfully minted {mintedAmount} H2O token to your wallet.&nbsp;
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
  }, [imageFile, twitterHandle])

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex gap-2">
        <div className="w-32 h-32">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => {
              setErrorMessage('')
              setSuccessMessage('')
              setImageFile(e.target.files?.[0] || null)
            }}
            hidden
          />

          <div
            className="border-2 border-gray-300 rounded-sm h-full w-full relative aspect-square bg-gray-100 hover:opacity-80 cursor-pointer overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            {imageFile ? (
              <Image
                src={URL.createObjectURL(imageFile)}
                alt="image"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <p className="text-sm text-gray-500 text-center">
                  No image <br /> selected
                </p>
              </div>
            )}
          </div>
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
          disabled={isLoading || !isValid}
          className="w-full max-w-md mt-2 bg-pink-800 hover:bg-pink-900"
          onClick={handleMint}
        >
          {isLoading ? 'Minting...' : 'Mint'}
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
