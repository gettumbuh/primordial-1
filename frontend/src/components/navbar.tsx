'use client'
import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'

export default function Navbar() {
  const [apiSecret, setApiSecret] = useState('')

  return (
    <div className="flex items-baseline p-4 z-10 flex-wrap">
      <p className="bg-gradient-to-tl from-pink-800 to-white bg-clip-text text-transparent font-bold text-3xl">
        Tumbuh
      </p>

      <div className="ml-4 text-white text-lg font-bold opacity-70 whitespace-nowrap">
        Primordial Experiment 1
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Input
          value={apiSecret}
          onChange={(e) => setApiSecret(e.target.value)}
          placeholder="API Secret"
          className="bg-white text-black max-w-24 min-w-0 p-2"
        />
        <Button
          onClick={() => {
            if (apiSecret === 'null') {
              localStorage.removeItem('primordialApiSecret')
              setApiSecret('')
              return
            }

            localStorage.setItem('primordialApiSecret', apiSecret)
            setApiSecret('')
          }}
        >
          Set
        </Button>
      </div>
    </div>
  )
}
