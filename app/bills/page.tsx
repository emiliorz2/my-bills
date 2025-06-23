// app/bills/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import BillList from '@/components/bills/BillList';
import BillsFilters from '@/components/bills/BillsFilters';
import FloatingButton from '@/components/ui/FloatingButton';
import useBills from '@/src/hooks/useBills';

export default function BillsPage() {
  const router = useRouter();
  const { status } = useSession();
  const { bills, error, isLoading, deleteBill } = useBills();
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

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

  const filteredData = bills.filter((gasto) => {
    const matchCategory = categoryFilter ? gasto.category === categoryFilter : true;
    const matchSearch = searchTerm
      ? gasto.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gasto.vendor?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchDate = (!startDate || new Date(gasto.date) >= new Date(startDate)) &&
                      (!endDate || new Date(gasto.date) <= new Date(endDate));
    return matchCategory && matchSearch && matchDate;
  });

  if (status === 'loading') {
    return <p className="p-6">Cargando...</p>;
  }

  return (
    <main className="relative min-h-screen px-4 py-10 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('/globe.svg')] bg-repeat" />
      <section className="relative max-w-5xl mx-auto space-y-6 z-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary text-center">📄 Facturas registradas</h1>

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

        {!isLoading && !error && (
          <BillList bills={filteredData} onEdit={handleEdit} onDelete={handleDelete} />
        )}

        <FloatingButton onClick={() => router.push('/new-bill')}>➕ Agregar Gasto</FloatingButton>
      </section>
    </main>
  );
}
