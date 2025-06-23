'use client';
//app/page.tsx

import MainContent from "@/components/MainContent";
import useBills from "@/src/hooks/useBills";
import useUser from "@/src/hooks/useUser";

export default function Home() {
  const { bills } = useBills();
  const { name } = useUser();

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
  const budget = 250000;
  const progress = Math.min((totalThisMonth / budget) * 100, 100);

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('/globe.svg')] bg-repeat" />
      <section className="relative max-w-3xl text-center space-y-6 z-10">
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-primary">
            Hola, {name} <span className="inline-block">👋</span>
          </h1>
          <p className="text-gray-700 text-lg sm:text-xl">
            Gastos este mes: {totalThisMonth.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })} · Top proveedor: {topVendor}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <MainContent />
      </section>
    </main>
  );
}
