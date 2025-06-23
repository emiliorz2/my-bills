'use client';

import GoBackButton from '@/components/ui/GoBackButton';
import { useState, useEffect } from 'react';
import useSettings from '@/src/hooks/useSettings';

export default function SettingsPage() {
  const { settings, saveSettings, isLoading } = useSettings();
  const [value, setValue] = useState(settings?.monthlyBudget ?? 0);

  useEffect(() => {
    if (settings) setValue(settings.monthlyBudget);
  }, [settings]);
  const suggestions = [
    'Actualizar datos personales',
    'Preferencias de notificación',
    'Moneda predeterminada y formato de números',
    'Categorías de gastos personalizadas',
    'Configuración de idioma y región',
    'Opciones de seguridad y autenticación',
    'Exportación o respaldo de datos',
    'Integraciones con otros servicios',
    'Apariencia o tema de la aplicación',
    'Eliminar cuenta o limpiar datos',
  ];

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <GoBackButton />
      <h1 className="text-3xl font-bold text-primary">Configuración</h1>
      <p className="text-gray-700">
        A continuación se muestran algunas ideas de ajustes que podrías incluir
        en tu aplicación para mejorar la experiencia de usuario:
      </p>
      <div className="space-y-2">
        <label htmlFor="budget" className="font-medium text-gray-800 block">
          Presupuesto mensual (CRC)
        </label>
        <div className="flex gap-2">
          <input
            id="budget"
            type="number"
            value={value}
            onChange={(e) => setValue(parseInt(e.target.value))}
            className="border border-gray-300 px-3 py-2 rounded-md w-full"
          />
          <button
            className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
            onClick={() => saveSettings({ monthlyBudget: value })}
            disabled={isLoading}
          >
            Guardar
          </button>
        </div>
      </div>
      <ul className="list-disc pl-6 space-y-2 text-gray-800">
        {suggestions.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="text-sm text-gray-500">
        Este apartado es solo una sugerencia inicial. Ajusta o extiende estas
        opciones según las necesidades específicas de tu proyecto.
      </p>
    </main>
  );
}