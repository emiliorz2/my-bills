// app/components/MainContent.tsx
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MainContent() {
  const [started, setStarted] = useState(false);
  const router = useRouter();

  const baseButton =
    'bg-primary hover:bg-primary/90 text-white font-medium rounded-lg px-6 py-3 transition duration-200 shadow-md hover:shadow-lg';

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      {!started ? (
        <div className="text-center bg-white shadow-xl rounded-xl p-8">
          <h1 className="text-4xl font-bold mb-6 text-gray-800">Bienvenido al sistema de facturación</h1>
          <button className={`${baseButton} text-lg`} onClick={() => setStarted(true)}>
            Iniciar
          </button>
        </div>
      ) : (
        <div className="text-center space-y-6 bg-white shadow-xl rounded-xl p-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Seleccione una opción</h2>
          <div className="flex flex-col items-center space-y-4">
            <button className={baseButton} onClick={() => router.push('/new-bill')}>
              Ingresar Factura
            </button>
            <button className={baseButton} onClick={() => router.push('/bills')}>
              Ver Facturas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
