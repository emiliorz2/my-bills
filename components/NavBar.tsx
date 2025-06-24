'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/IA-Budget.png"
                alt="IA Budget"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
                priority
              />
              <span className="font-semibold text-xl text-primary hidden sm:inline">IA Budget</span>
            </Link>

            {/* Links desktop */}
            <nav className="hidden md:flex space-x-6">
              <NavLinks />
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setOpen(!open)}
                className="text-gray-700 focus:outline-none"
                aria-label="Toggle menu"
              >
                {open ? (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setOpen(false)} />
      )}

      {/* Mobile menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'} md:hidden`}
      >
        <div className="flex justify-end p-4">
          <button onClick={() => setOpen(false)} aria-label="Cerrar">
            <svg className="h-6 w-6 text-gray-700" viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <MobileNavLinks onClick={() => setOpen(false)} />
        </div>
      </div>
    </>
  );
}

function NavLinks() {
  const { status } = useSession();
  return (
    <>
      {[
        ['/', 'Inicio'],
        ['/bills', 'Facturas'],
        ['/analytics', 'Reportes'],
        ['/settings', 'Configuración'],
      ].map(([href, label]) => (
        <Link
          key={href}
          href={href}
          className="text-gray-700 hover:text-primary font-medium transition duration-150"
        >
          {label}
        </Link>
      ))}
      {status === 'authenticated' ? (
        <Link href="/logout" className="text-gray-700 hover:text-primary font-medium">Salir</Link>
      ) : (
        <Link href="/login" className="text-gray-700 hover:text-primary font-medium">Ingresar</Link>
      )}
    </>
  );
}

function MobileNavLinks({ onClick }: { onClick: () => void }) {
  const { status } = useSession();
  return (
    <div className="flex flex-col space-y-4">
      {[
        ['/', 'Inicio'],
        ['/bills', 'Facturas'],
        ['/analytics', 'Reportes'],
        ['/settings', 'Configuración'],
      ].map(([href, label]) => (
        <Link
          key={href}
          href={href}
          className="text-gray-800 hover:text-primary font-medium"
          onClick={onClick}
        >
          {label}
        </Link>
      ))}
      {status === 'authenticated' ? (
        <Link href="/logout" className="text-gray-800 hover:text-primary font-medium" onClick={onClick}>Salir</Link>
      ) : (
        <Link href="/login" className="text-gray-800 hover:text-primary font-medium" onClick={onClick}>Ingresar</Link>
      )}
    </div>
  );
}
