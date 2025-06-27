'use client'

import { signOut } from 'next-auth/react'
import { useEffect } from 'react'

export default function LogoutPage() {
  useEffect(() => {
    signOut({ callbackUrl: '/login' })
  }, [])
  return (
    <main className="min-h-screen flex items-center justify-center">
      <p>Cerrando sesión...</p>
    </main>
  )
}
