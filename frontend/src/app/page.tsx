'use client'

import { usePrimordialUsersStore } from '../stores/primordialUsers'
import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '@/components/navbar'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Users from '@/components/users'
import Mint from '@/components/mint'
import SellAdmin from '@/components/sellAdmin'
import Sell from '@/components/sell'

const API_URL = process.env.NEXT_PUBLIC_SERVER_HOST

export default function Home() {
  const [tab, setTab] = useState('users')
  const [apiSecret, setApiSecret] = useState<string | null>(null)

  const { setUsers, setLoading, setError } = usePrimordialUsersStore()

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/users`)
      setUsers(response.data.users)
    } catch (error) {
      setError(error as string)
    } finally {
      setLoading(false)
    }
  }, [setUsers, setLoading, setError])

  useEffect(() => {
    setLoading(true)
    fetchUsers()
    const API_SECRET = localStorage.getItem('primordialApiSecret')
    if (API_SECRET) {
      setApiSecret(API_SECRET)
    }
  }, [fetchUsers, setApiSecret, setLoading])

  return (
    <div className="flex flex-col h-screen bg-black">
      <Navbar />

      <div className="flex flex-col items-center justify-center min-h-dvh bg-black absolute top-0 left-0 w-full h-full">
        <div className="flex flex-col items-end justify-center w-full h-dvh bg-black relative overflow-hidden">
          <div className="relative h-full w-full max-w-[500px]">
            <Image
              src="/images/flower.jpg"
              alt="logo"
              fill
              className="object-cover object-center rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-[720px] h-full w-full bg-white/15 backdrop-blur-lg rounded-md overflow-hidden">
          <Tabs
            defaultValue={tab}
            className="w-full h-full"
            onValueChange={(value) => setTab(value)}
          >
            <TabsList className="w-full rounded-none">
              <TabsTrigger
                value="users"
                className="rounded-sm"
                onClick={() => setTab('users')}
              >
                Users
              </TabsTrigger>
              <TabsTrigger
                value="mint"
                className="rounded-sm"
                onClick={() => setTab('mint')}
              >
                Mint Water
              </TabsTrigger>
              <TabsTrigger
                value="sell"
                className="rounded-sm"
                onClick={() => setTab('sell')}
              >
                Sell Water
              </TabsTrigger>
              {apiSecret && (
                <TabsTrigger
                  value="sellAdmin"
                  className="rounded-sm"
                  onClick={() => setTab('sellAdmin')}
                >
                  Sell Admin
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent
              value="users"
              className="flex-1 flex flex-col max-h-[calc(100vh-182px)]"
            >
              <Users />
            </TabsContent>
            <TabsContent value="mint">
              <Mint />
            </TabsContent>
            <TabsContent value="sell">
              <Sell />
            </TabsContent>
            <TabsContent value="sellAdmin">
              <SellAdmin />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
