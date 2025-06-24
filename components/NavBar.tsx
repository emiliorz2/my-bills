'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'


export default function NavBar() {
  const [open, setOpen] = useState(false)

  // Desactiva scroll cuando se abre el menú móvil
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'auto'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [open])

  return (
    <>
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/">
                <Image
                  src="/IA-Budget.png"
                  alt="IA-Budget Logo"
                  width={32}
                  height={32}
                  className="h-8 w-auto mr-2"
                  style={{ display: 'inline-block', verticalAlign: 'middle' }}
                  priority
                />
              </Link>
            </div>

            <div className="hidden md:flex space-x-6">
              <NavLinks />
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setOpen(!open)}
                className="text-gray-700 focus:outline-none"
                aria-label="Toggle menu"
              >
                {open ? (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Fondo oscuro */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Menú móvil con animación deslizante */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'
          } md:hidden`}
      >
        <div className="flex justify-end p-4">
          <button onClick={() => setOpen(false)} aria-label="Cerrar">
            <svg className="h-6 w-6 text-gray-700" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <MobileNavLinks onClick={() => setOpen(false)} />
        </div>
      </div>
    </>
  )
}

function NavLinks() {
  const { status } = useSession()
  return (
    <>
      <Link href="/" className="text-gray-700 hover:text-primary font-medium transition">Inicio</Link>
      <Link href="/bills" className="text-gray-700 hover:text-primary font-medium transition">Facturas</Link>
      <Link href="/analytics" className="text-gray-700 hover:text-primary font-medium transition">Reportes</Link>
      <Link href="/settings" className="text-gray-700 hover:text-primary font-medium transition">Configuración</Link>
      {status === 'authenticated' ? (
        <Link href="/logout" className="text-gray-700 hover:text-primary font-medium transition">Salir</Link>
      ) : (
        <Link href="/login" className="text-gray-700 hover:text-primary font-medium transition">Ingresar</Link>
      )}
    </>
  )
}

function MobileNavLinks({ onClick }: { onClick: () => void }) {
  const { status } = useSession()
  return (
    <div className="flex flex-col space-y-3">
      <Link href="/" className="text-gray-800 hover:text-primary font-medium" onClick={onClick}>Inicio</Link>
      <Link href="/bills" className="text-gray-800 hover:text-primary font-medium" onClick={onClick}>Facturas</Link>
      <Link href="/analytics" className="text-gray-800 hover:text-primary font-medium" onClick={onClick}>Reportes</Link>
      <Link href="/settings" className="text-gray-800 hover:text-primary font-medium" onClick={onClick}>Configuración</Link>
      {status === 'authenticated' ? (
        <Link href="/logout" className="text-gray-800 hover:text-primary font-medium" onClick={onClick}>Salir</Link>
      ) : (
        <Link href="/login" className="text-gray-800 hover:text-primary font-medium" onClick={onClick}>Ingresar</Link>
      )}
    </div>
  )
}
