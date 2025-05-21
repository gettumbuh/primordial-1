'use client'

import axios from 'axios'
import { usePrimordialUsersStore } from '@/stores/primordialUsers'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from './ui/button'
import Identicon from '@polkadot/react-identicon'
import { encodeAddress } from '@polkadot/util-crypto'
import { hexToU8a } from '@polkadot/util'

const API_URL = process.env.NEXT_PUBLIC_SERVER_HOST

const formatAddress = (address: string) => {
  return address.slice(0, 6) + '...' + address.slice(-4)
}

const getSs58Address = (address: string) => {
  const ethU8a = hexToU8a(address)
  const paddedU8a = new Uint8Array(32)
  paddedU8a.set(ethU8a, 12)
  return encodeAddress(paddedU8a, 42)
}

export default function Users() {
  const [twitterId, setTwitterId] = useState('')
  const [twitterHandle, setTwitterHandle] = useState('')
  const {
    setError,
    setLoading,
    users,
    deleteUser: deleteUserFromStore,
    setUsers,
  } = usePrimordialUsersStore()

  const [apiSecret, setApiSecret] = useState<string | null>(null)

  useEffect(() => {
    const API_SECRET = localStorage.getItem('primordialApiSecret')
    console.log('API_SECRET', API_SECRET)
    if (API_SECRET) {
      setApiSecret(API_SECRET)
    }
  }, [])

  const createUser = async () => {
    try {
      const API_SECRET = localStorage.getItem('primordialApiSecret')
      console.log('twitterId', twitterId)

      const response = await axios.post(
        `${API_URL}/users`,
        {
          users: [
            {
              twitterId: twitterId,
              twitterHandle: twitterHandle,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${API_SECRET}`,
          },
        }
      )

      setTwitterId('')
      setTwitterHandle('')
      setError('')

      console.log('user created', response.data)
      setUsers(response.data.users)
    } catch (error) {
      console.log('error', error)
      setError(error as string)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (twitterId: string) => {
    try {
      const API_SECRET = localStorage.getItem('primordialApiSecret')
      const response = await axios.delete(`${API_URL}/users/${twitterId}`, {
        headers: {
          Authorization: `Bearer ${API_SECRET}`,
        },
      })

      console.log('user deleted', response.data)
      deleteUserFromStore(twitterId)
    } catch (error) {
      console.log('error', error)
      setError(error as string)
    }
  }
  return (
    <div className="flex flex-col gap-4 h-full flex-1 max-h-full overflow-y-auto">
      <div className="flex flex-col flex-1">
        {users && users.length > 0 ? (
          users.map((user) => (
            <div key={user.twitterId} className="flex flex-col mb-4">
              <div
                key={user.twitterId}
                className="flex flex-wrap gap-2 items-center text-white py-2 px-4"
              >
                <div className="h-6 w-6 bg-white rounded-full overflow-hidden">
                  <Identicon
                    value={getSs58Address(user.address)}
                    size={24}
                    theme="ethereum"
                  />
                </div>
                <p className="text-lg">{user.twitterHandle}</p>
                <p className="text-sm opacity-80">
                  {formatAddress(user.address)}
                </p>
                <Button
                  size="sm"
                  className="hidden md:block ml-auto bg-black text-white px-1 h-5 rounded-sm text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(user.address)
                  }}
                >
                  Copy
                </Button>
                <Button
                  size="sm"
                  className="hidden md:block bg-black text-white px-1 h-5 rounded-sm text-xs"
                  onClick={() => {
                    window.open(
                      `https://scrollscan.com/address/${user.address}`,
                      '_blank'
                    )
                  }}
                >
                  Explorer
                </Button>
                {apiSecret && (
                  <Button
                    size="sm"
                    className="bg-black text-white px-1 h-5 rounded-sm text-xs hidden md:block"
                    onClick={() => deleteUser(user.twitterId)}
                  >
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex md:hidden gap-2 items-center px-4">
                <Button
                  size="sm"
                  className="bg-black text-white px-1 h-5 rounded-sm text-xs"
                >
                  Copy
                </Button>
                <Button
                  size="sm"
                  className="bg-black text-white px-1 h-5 rounded-sm text-xs"
                >
                  Explorer
                </Button>
                {apiSecret && (
                  <Button
                    size="sm"
                    className="bg-black text-white px-1 h-5 rounded-sm text-xs"
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-200">
            No user found
          </div>
        )}
      </div>

      <div className="flex gap-2 items-center px-4 pb-4">
        <Input
          placeholder="Twitter ID"
          value={twitterId}
          onChange={(e) => setTwitterId(e.target.value)}
          className="flex-1 bg-white text-black rounded-xs h-7 px-2 py-0 min-h-0"
        />
        <Input
          placeholder="Twitter Handle"
          value={twitterHandle}
          onChange={(e) => setTwitterHandle(e.target.value)}
          className="flex-1 bg-white text-black rounded-xs h-7 px-2 py-0 min-h-0"
          size={20}
        />
        <Button
          onClick={createUser}
          className="rounded-sm px-2 py-1 h-7 cursor-pointer hover:opacity-80"
        >
          Create User
        </Button>
      </div>
    </div>
  )
}
