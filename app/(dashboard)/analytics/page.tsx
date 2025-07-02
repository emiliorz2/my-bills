'use client';
// app/analytics/page.tsx

import useSWR from 'swr';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import BackgroundGlobe from '@/components/BackgroundGlobe';


const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AnalyticsPage() {
  const { data, error, isLoading } = useSWR('/api/export', fetcher);

  const handleExport = async () => {
    if (!data || !data.success) return;

    const workbook = new ExcelJS.Workbook();

    Object.entries(data.data).forEach(([sheetName, rows]) => {
      const worksheet = workbook.addWorksheet(sheetName);
      if (Array.isArray(rows) && rows.length > 0) {
        worksheet.columns = Object.keys(rows[0]).map(key => ({ header: key, key }));
      }
      worksheet.addRows(rows as unknown[]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'gastos_exportados.xlsx');
  };

  if (isLoading) return <p className="p-6">Cargando...</p>;
  if (error) return <p className="p-6 text-red-600">Error al cargar datos</p>;

  return (
    <main className="relative min-h-screen px-4 py-10 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
      <BackgroundGlobe />
      <section className="relative max-w-4xl mx-auto space-y-6 z-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary text-center">📊 Analítica</h1>

        <button
          onClick={handleExport}
          className="btn-green"
        >
          📥 Exportar Excel
        </button>

        <p className="text-gray-700">Exporta todos los gastos, detalles e ingresos asociados en un solo archivo Excel.</p>
      </section>
    </main>
  );
}
