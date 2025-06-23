'use client'

import { useSession } from 'next-auth/react'

export default function useUser() {
  const { data: session } = useSession()
  return {
    name: session?.user?.name ?? null,
    email: session?.user?.email ?? null,
    id: (session?.user as { id?: string })?.id,
  }
}
