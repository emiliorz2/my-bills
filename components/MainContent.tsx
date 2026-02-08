"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MainContent() {
  const router = useRouter();
  const { data } = useSWR('/api/export', fetcher);

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

  const actions = [
    {
      title: 'Registrar gasto',
      description: 'Carga una factura o registra un pago manual.',
      icon: '➕',
      action: () => router.push('/new-bill'),
    },
    {
      title: 'Ver facturas',
      description: 'Filtra y organiza el historial completo.',
      icon: '📄',
      action: () => router.push('/bills'),
    },
    {
      title: 'Analítica',
      description: 'Visualiza tu progreso y exporta reportes.',
      icon: '📊',
      action: () => router.push('/analytics'),
    },
    {
      title: 'Exportar datos',
      description: 'Descarga un Excel con tus registros.',
      icon: '📤',
      action: handleExport,
    },
  ];

  return (
    <motion.section
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {actions.map(({ title, description, icon, action }) => (
        <motion.div
          key={title}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={action}
          className="cursor-pointer select-none rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-md transition hover:-translate-y-1"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{icon}</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
            </div>
            <span className="text-gray-400">➜</span>
          </div>
        </motion.div>
      ))}
    </motion.section>
  );
}
