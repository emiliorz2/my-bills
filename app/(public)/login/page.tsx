'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    })
    if (res?.error) {
      setError('Credenciales incorrectas')
    } else {
      router.push('/bills')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card w-full max-w-md sm:max-w-xl mx-auto p-6 space-y-4 relative z-10">
      <h1 className="text-xl font-bold text-center">Iniciar sesión</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="input"
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="input"
        required
      />
      <button type="submit" className="btn-primary w-full">
        Ingresar
      </button>
    </form>
  )
}
