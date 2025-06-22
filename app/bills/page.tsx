// app/bills/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { useState } from 'react';
import {formatDateSafe} from '@/src/utils';

interface Expense {
  id: number;
  vendor: string | null;
  description: string;
  total: number;
  currency: string;
  expenseType: string;
  category?: string;
  date: string;
  source: {
    type: string;
    description: string | null;
    receivedAt: string;
  };
  invoiceDetails: {
    product: string;
    quantity: number;
    unitPrice: number;
  }[];
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const CATEGORIES = [
  'FOOD',
  'TRANSPORT',
  'MEDICAL',
  'SERVICES',
  'SUBSCRIPTIONS',
  'INSTALLMENTS',
  'ENTERTAINMENT',
  'HOUSEHOLD',
  'EDUCATION',
  'OTHER',
];

export default function BillsPage() {
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR('/api/expenses', fetcher);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleEdit = (id: number) => {
    router.push(`/bills/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro que desea eliminar esta factura?')) return;

    const res = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      toast.success('Factura eliminada correctamente');
      mutate();
    } else {
      toast.error('Ocurrió un error al eliminar la factura.');
    }
  };

  const filteredData = data?.data?.filter((gasto: Expense) => {
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

      <div className="mb-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="mr-2 font-medium">Filtrar por categoría:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md"
          >
            <option value="">Todas</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mr-2 font-medium">Buscar:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md"
            placeholder="Proveedor o descripción"
          />
        </div>

        <div>
          <label className="mr-2 font-medium">Desde:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md"
          />
        </div>

        <div>
          <label className="mr-2 font-medium">Hasta:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md"
          />
        </div>
      </div>

      {isLoading && <p className="text-gray-600">Cargando facturas...</p>}
      {error && <p className="text-red-600">❌ Error al cargar las facturas.</p>}

      {!isLoading && !error && (
        <>
          {filteredData?.length === 0 ? (
            <p className="text-gray-500 text-center">No hay facturas registradas aún.</p>
          ) : (
            <ul className="space-y-6">
              {filteredData.map((gasto: Expense) => (
                <li
                  key={gasto.id}
                  className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {gasto.vendor || 'Proveedor desconocido'}
                    </h2>
                    <span className="text-sm text-gray-500">
                      {formatDateSafe(gasto.date)}
                    </span>
                  </div>

                  <p className="text-gray-700">{gasto.description}</p>

                  {gasto.category && (
                    <p className="text-sm text-blue-600 font-medium mt-1">
                      Categoría: {gasto.category}
                    </p>
                  )}

                  <p className="text-xl font-bold text-green-600 mt-3">
                    {gasto.total.toLocaleString('es-CR', {
                      style: 'currency',
                      currency: gasto.currency,
                    })}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Origen: <span className="italic">{gasto.source.type}</span>
                    {gasto.source.description && ` (${gasto.source.description})`}
                  </p>

                  {gasto.expenseType === 'invoice' && gasto.invoiceDetails.length > 0 && (
                    <div className="mt-4 bg-gray-50 p-3 rounded-md border">
                      <p className="font-semibold mb-1 text-sm text-gray-700">Detalles de factura:</p>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                        {gasto.invoiceDetails.map((item, idx) => (
                          <li key={idx}>
                            {item.quantity} x {item.product} @{' '}
                            {item.unitPrice.toLocaleString('es-CR', {
                              style: 'currency',
                              currency: gasto.currency,
                            })}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleEdit(gasto.id)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600 transition"
                    >
                      Modificar
                    </button>
                    <button
                      onClick={() => handleDelete(gasto.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => router.push('/new-bill')}
        className="fixed bottom-8 right-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition text-sm font-semibold"
      >
        ➕ Agregar Gasto
      </button>
    </div>
  );
}
