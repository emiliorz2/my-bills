//app/analytics/page.tsx

'use client';

import useSWR from 'swr';

interface Expense {
  id: number;
  vendor: string | null;
  description: string;
  total: number;
  currency: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AnalyticsPage() {
  const { data, error, isLoading } = useSWR('/api/expenses', fetcher);

  if (isLoading) return <p className="p-6">Cargando...</p>;
  if (error) return <p className="p-6 text-red-600">Error al cargar datos</p>;

  const expenses: Expense[] = data?.data || [];

  const totalsByCurrency = expenses.reduce<Record<string, number>>((acc, exp) => {
    acc[exp.currency] = (acc[exp.currency] || 0) + exp.total;
    return acc;
  }, {});

  const vendorTotals = expenses.reduce<Record<string, number>>((acc, exp) => {
    if (!exp.vendor) return acc;
    acc[exp.vendor] = (acc[exp.vendor] || 0) + exp.total;
    return acc;
  }, {});

  const topVendorEntry = Object.entries(vendorTotals).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">📊 Analítica</h1>

      <p className="mb-4 text-gray-700">Total de registros: {expenses.length}</p>

      <h2 className="text-xl font-semibold text-gray-800 mb-2">Totales por moneda</h2>
      <ul className="space-y-1 mb-6">
        {Object.entries(totalsByCurrency).map(([currency, total]) => (
          <li key={currency} className="text-gray-700">
            {currency}: {total.toLocaleString('es-CR', { style: 'currency', currency })}
          </li>
        ))}
      </ul>

      {topVendorEntry && (
        <p className="text-gray-700">
          Proveedor con más gastos: <span className="font-semibold">{topVendorEntry[0]}</span> ({topVendorEntry[1].toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })})
        </p>
      )}
    </div>
  )
}