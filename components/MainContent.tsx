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
    { title: 'Ingresar Factura', icon: '➕', action: () => router.push('/new-bill') },
    { title: 'Ver Facturas', icon: '📄', action: () => router.push('/bills') },
    { title: 'Reportes', icon: '📊', action: () => router.push('/analytics') },
    { title: 'Exportar Datos', icon: '📤', action: handleExport },
  ];

  return (
    <motion.section
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {actions.map(({ title, icon, action }) => (
        <motion.div
          key={title}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={action}
          className="cursor-pointer select-none p-6 rounded-xl shadow-lg bg-white/60 backdrop-blur-md flex flex-col items-center justify-center space-y-2"
        >
          <span className="text-4xl">{icon}</span>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </motion.div>
      ))}
    </motion.section>
  );
}
