'use client';
// app/bills/page.tsx

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMemo, useState } from 'react';
import BillList from '@/components/bills/BillList';
import BillsFilters from '@/components/bills/BillsFilters';
import FloatingButton from '@/components/ui/FloatingButton';
import useBills from '@/src/hooks/useBills';
import BackgroundGlobe from '@/components/BackgroundGlobe';

export default function BillsPage() {
  const router = useRouter();
  const { bills, error, isLoading, deleteBill } = useBills();
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleEdit = (id: number) => {
    router.push(`/bills/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro que desea eliminar esta factura?')) return;

    try {
      await deleteBill(id);
      toast.success('Factura eliminada correctamente');
    } catch {
      toast.error('Ocurrió un error al eliminar la factura.');
    }
  };

  const filteredData = useMemo(() => (
    bills.filter((gasto) => {
      const matchCategory = categoryFilter ? gasto.category === categoryFilter : true;
      const matchSearch = searchTerm
        ? gasto.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gasto.vendor?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const matchDate = (!startDate || new Date(gasto.date) >= new Date(startDate)) &&
                        (!endDate || new Date(gasto.date) <= new Date(endDate));
      return matchCategory && matchSearch && matchDate;
    })
  ), [bills, categoryFilter, searchTerm, startDate, endDate]);

  const totalAmount = filteredData.reduce((sum, bill) => sum + bill.total, 0);
  const uniqueVendors = new Set(filteredData.map((bill) => bill.vendor || 'Desconocido')).size;

  return (
    <main className="relative min-h-screen px-4 py-10 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
      <BackgroundGlobe />
      <section className="relative max-w-5xl mx-auto space-y-6 z-10">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary">📄 Facturas registradas</h1>
          <p className="text-gray-600">
            Revisa, filtra y gestiona tus gastos recientes sin fricción.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Gastos filtrados', value: filteredData.length.toString() },
            {
              label: 'Total filtrado',
              value: totalAmount.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' }),
            },
            { label: 'Proveedores únicos', value: uniqueVendors.toString() },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-xl font-semibold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>

        <BillsFilters
          category={categoryFilter}
          onCategoryChange={setCategoryFilter}
          search={searchTerm}
          onSearchChange={setSearchTerm}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
        />

        {isLoading && <p className="text-gray-600">Cargando facturas...</p>}
        {error && <p className="text-red-600">❌ Error al cargar las facturas.</p>}

        {!isLoading && !error && filteredData.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-8 text-center text-gray-600">
            <p className="text-lg font-semibold text-gray-800">Aún no hay facturas que mostrar.</p>
            <p className="mt-2">Prueba agregando un gasto o ajusta los filtros para ver resultados.</p>
          </div>
        )}

        {!isLoading && !error && filteredData.length > 0 && (
          <BillList bills={filteredData} onEdit={handleEdit} onDelete={handleDelete} />
        )}

        <FloatingButton onClick={() => router.push('/new-bill')}>➕ Agregar Gasto</FloatingButton>
      </section>
    </main>
  );
}
