'use client';
//app/page.tsx

import MainContent from "@/components/MainContent";
import useBills from "@/src/hooks/useBills";
import useUser from "@/src/hooks/useUser";
import useSettings from "@/src/hooks/useSettings";

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

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('/globe.svg')] bg-repeat" />
      <section className="relative max-w-3xl text-center space-y-6 z-10">
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-primary">
            Hola, {name ?? 'Usuario'} <span className="inline-block">👋</span>
          </h1>
          <p className="text-gray-700 text-lg sm:text-xl">
            Gastos este mes: {totalThisMonth.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })} · Top proveedor: {topVendor}
          </p>
          <div className="relative w-full bg-gray-200 rounded-full h-4 mt-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-800">
              {totalThisMonth.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })} /
              {budget.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}
            </span>
          </div>
        </div>
        <MainContent />
      </section>
    </main>
  );
}
