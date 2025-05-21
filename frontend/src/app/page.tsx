'use client'

import { usePrimordialUsersStore } from '../stores/primordialUsers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '@/components/navbar'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Users from '@/components/users'
import Mint from '@/components/mint'

const API_URL = process.env.NEXT_PUBLIC_SERVER_HOST

export default function Home() {
  const [tab, setTab] = useState('users')

  const { setUsers, setLoading, setError } = usePrimordialUsersStore()

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`)
      setUsers(response.data.users)
      console.log('users', response.data)
    } catch (error) {
      setError(error as string)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchUsers()
  }, [])

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
            </TabsList>

            <TabsContent value="users" className="flex-1 flex flex-col max-h-[calc(100vh-182px)]">
              <Users />
            </TabsContent>
            <TabsContent value="mint">
              <Mint />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
