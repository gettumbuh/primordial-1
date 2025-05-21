import { create } from 'zustand'

// id: 'id',
//   twitterId: 'twitterId',
//   twitterHandle: 'twitterHandle',
//   address: 'address',
//   privateKey: 'privateKey',
//   createdAt: 'createdAt',
//   updatedAt: 'updatedAt'

interface PrimordialUser {
  id: string
  twitterId: string
  twitterHandle: string
  address: string
  privateKey: string
  createdAt: Date
  updatedAt: Date
}

interface PrimordialUsersState {
  users: PrimordialUser[]
  isLoading: boolean
  error: string | null
  
  // Actions
  setUsers: (users: PrimordialUser[]) => void
  addUser: (user: PrimordialUser) => void
  updateUser: (id: string, user: Partial<PrimordialUser>) => void
  deleteUser: (id: string) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const usePrimordialUsersStore = create<PrimordialUsersState>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  setUsers: (users) => set({ users }),
  
  addUser: (user) => set((state) => ({
    users: [...state.users, user]
  })),
  
  updateUser: (id, updatedUser) => set((state) => ({
    users: state.users.map((user) =>
      user.id === id ? { ...user, ...updatedUser } : user
    )
  })),

  deleteUser: (twitterId) =>
    set((state) => ({
      users: state.users.filter((user) => user.twitterId !== twitterId),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error })
}))
