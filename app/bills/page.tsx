// app/bills/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useState } from 'react';
import BillList from '@/components/bills/BillList';
import BillsFilters from '@/components/bills/BillsFilters';
import FloatingButton from '@/components/ui/FloatingButton';
import useBills from '@/src/hooks/useBills';

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

  return (
    <div className="relative min-h-screen p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">📄 Facturas registradas</h1>

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
    </div>
  );
}
