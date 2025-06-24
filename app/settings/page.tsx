'use client';

import GoBackButton from '@/components/ui/GoBackButton';
import { useState, useEffect } from 'react';
import useSettings from '@/src/hooks/useSettings';

export default function SettingsPage() {
  const { settings, saveSettings, isLoading } = useSettings();
  const [budget, setBudget] = useState(settings?.monthlyBudget ?? 0);
  const [currency, setCurrency] = useState(settings?.preferredCurrency ?? 'CRC');
  const [rate, setRate] = useState(settings?.exchangeRate ?? 0);

  useEffect(() => {
    if (settings) {
      setBudget(settings.monthlyBudget);
      setCurrency(settings.preferredCurrency);
      setRate(settings.exchangeRate ?? 0);
    }
  }, [settings]);
  const suggestions = [
    'Actualizar datos personales',
    'Preferencias de notificación',
    'Categorías de gastos personalizadas',
    'Configuración de idioma y región',
    'Opciones de seguridad y autenticación',
    'Exportación o respaldo de datos',
    'Integraciones con otros servicios',
    'Apariencia o tema de la aplicación',
    'Eliminar cuenta o limpiar datos',
  ];

  const handleSave = () => {
    saveSettings({
      monthlyBudget: budget,
      preferredCurrency: currency,
      exchangeRate: rate,
    });
  };

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-8">
      <GoBackButton />
      <h1 className="text-3xl font-bold text-primary">Configuración</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Ajustes financieros</h2>
        <div className="space-y-2">
          <label htmlFor="budget" className="font-medium text-gray-800 block">
            Presupuesto mensual ({currency})
          </label>
          <input
            id="budget"
            type="number"
            value={budget}
            onChange={(e) => setBudget(parseInt(e.target.value))}
            className="border border-gray-300 px-3 py-2 rounded-md w-full"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="currency" className="font-medium text-gray-800 block">
            Moneda preferida
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md w-full"
          >
            <option value="CRC">CRC</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="rate" className="font-medium text-gray-800 block">
            Tipo de cambio a CRC
          </label>
          <input
            id="rate"
            type="number"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="border border-gray-300 px-3 py-2 rounded-md w-full"
          />
        </div>
        <button
          className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
          onClick={handleSave}
          disabled={isLoading}
        >
          Guardar
        </button>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-800">Otras opciones</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-800">
          {suggestions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-sm text-gray-500">
          Estas secciones son solo un bosquejo inicial y aún no tienen
          funcionalidad.
        </p>
      </section>
    </main>
  );
}