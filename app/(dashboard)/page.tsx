'use client';
//app/page.tsx

import MainContent from "@/components/MainContent";
import useBills from "@/src/hooks/useBills";
import useUser from "@/src/hooks/useUser";
import useSettings from "@/src/hooks/useSettings";
import BackgroundGlobe from '@/components/BackgroundGlobe';

export default function Home() {
  const { bills } = useBills();
  const { name } = useUser();
  const { settings } = useSettings();

  const now = new Date();
  const monthlyBills = bills.filter((b) => {
    const d = new Date(b.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalThisMonth = monthlyBills.reduce((sum, b) => sum + b.total, 0);
  const vendorTotals: Record<string, number> = {};
  monthlyBills.forEach((b) => {
    const vendor = b.vendor || 'Desconocido';
    vendorTotals[vendor] = (vendorTotals[vendor] || 0) + b.total;
  });
  const topVendor = Object.entries(vendorTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-';
  const budget = settings?.monthlyBudget ?? 0;
  const progress = budget > 0 ? Math.min((totalThisMonth / budget) * 100, 100) : 0;
  const remaining = Math.max(budget - totalThisMonth, 0);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const avgPerDay = daysInMonth ? totalThisMonth / daysInMonth : 0;
  const formatter = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' });

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 py-8 sm:py-16 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
      <BackgroundGlobe />
      <section className="relative max-w-5xl w-full space-y-8 z-10">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-primary">
            Hola, {name ?? 'Usuario'} <span className="inline-block">👋</span>
          </h1>
          <p className="text-gray-700 text-lg sm:text-xl">
            Tu panel financiero en un vistazo: controla el gasto, el presupuesto y tus tendencias clave.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Gasto del mes', value: formatter.format(totalThisMonth), note: `Top proveedor: ${topVendor}` },
            { label: 'Presupuesto restante', value: formatter.format(remaining), note: `Meta: ${formatter.format(budget)}` },
            { label: 'Promedio diario', value: formatter.format(avgPerDay), note: `${daysInMonth} días en el mes` },
            { label: 'Facturas del mes', value: monthlyBills.length.toString(), note: 'Total de registros' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-white/80 p-5 shadow-sm backdrop-blur">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-500 mt-1">{item.note}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Presupuesto mensual</h2>
              <p className="text-sm text-gray-600">Seguimiento continuo de tu meta financiera.</p>
            </div>
            <p className="text-sm text-gray-500">
              {formatter.format(totalThisMonth)} / {formatter.format(budget)}
            </p>
          </div>
          <div className="relative w-full bg-gray-200 rounded-full h-4 mt-4 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-800">
              {Math.round(progress)}% completado
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 text-center">Acciones rápidas</h2>
          <MainContent />
        </div>
      </section>
    </main>
  );
}
