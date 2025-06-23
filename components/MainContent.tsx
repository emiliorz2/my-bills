"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MainContent() {
  const router = useRouter();
  const { data } = useSWR('/api/export', fetcher);

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

  const actions = [
    { title: 'Ingresar Factura', icon: '➕', action: () => router.push('/new-bill') },
    { title: 'Ver Facturas', icon: '📄', action: () => router.push('/bills') },
    { title: 'Reportes', icon: '📊', action: () => router.push('/analytics') },
    { title: 'Exportar Datos', icon: '📤', action: handleExport },
  ];

  return (
    <motion.section
      className="grid grid-cols-1 sm:grid-cols-2 gap-6"
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
