// app/bills/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import useSWR from 'swr';

interface Expense {
  id: number;
  vendor: string | null;
  description: string;
  total: number;
  currency: string;
  expenseType: string;
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

export default function BillsPage() {
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR('/api/expenses', fetcher);

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
      mutate(); // Refrescar lista después de borrar
    } else {
      toast.error('Ocurrió un error al eliminar la factura.');
    }
  };

  return (
    <div className="relative min-h-screen p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">📄 Facturas registradas</h1>

      {isLoading && <p className="text-gray-600">Cargando facturas...</p>}
      {error && <p className="text-red-600">❌ Error al cargar las facturas.</p>}

      {!isLoading && !error && (
        <>
          {data?.data?.length === 0 ? (
            <p className="text-gray-500 text-center">No hay facturas registradas aún.</p>
          ) : (
            <ul className="space-y-6">
              {data.data.map((gasto: Expense) => (
                <li
                  key={gasto.id}
                  className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {gasto.vendor || 'Proveedor desconocido'}
                    </h2>
                    <span className="text-sm text-gray-500">
                      {new Date(gasto.date).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-gray-700">{gasto.description}</p>

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
