// app/analytics/page.tsx
'use client';

import useSWR from 'swr';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface Expense {
  id: number;
  vendor: string | null;
  description: string;
  total: number;
  currency: string;
  date: string;
  category?: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AnalyticsPage() {
  const { data, error, isLoading } = useSWR('/api/export', fetcher);

  const handleExport = () => {
    if (!data || !data.success) return;

    const wb = XLSX.utils.book_new();

    Object.entries(data.data).forEach(([sheetName, rows]) => {
      const ws = XLSX.utils.json_to_sheet(rows as any[]);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'gastos_exportados.xlsx');
  };

  if (isLoading) return <p className="p-6">Cargando...</p>;
  if (error) return <p className="p-6 text-red-600">Error al cargar datos</p>;

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">📊 Analítica</h1>

      <button
        onClick={handleExport}
        className="mb-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow"
      >
        📥 Exportar Excel
      </button>

      <p className="text-gray-700">Exporta todos los gastos, detalles e ingresos asociados en un solo archivo Excel.</p>
    </div>
  );
}
