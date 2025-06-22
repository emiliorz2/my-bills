//app/bills/[id]/edit/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface Expense {
  id: number;
  vendor: string | null;
  description: string;
  total: number;
  currency: string;
  categoria: string | null;
}

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

export default function EditBillPage() {
  const { id } = useParams();
  const router = useRouter();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    vendor: '',
    description: '',
    total: '',
    currency: 'CRC',
    category: '',
  });

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/expenses/${id}`);
      const data = await res.json();

      if (data?.data) {
        setExpense(data.data);
        setForm({
          vendor: data.data.vendor || '',
          description: data.data.description,
          total: data.data.total.toString(),
          currency: data.data.currency || 'CRC',
          category: data.data.category || '',
        });
      }

      setLoading(false);
    }

    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        total: parseFloat(form.total),
      }),
    });

    if (res.ok) {
      router.push('/bills');
    } else {
      toast.error('❌ Ocurrió un error al actualizar la factura.');
    }
  };

  if (loading) return <p className="p-6">Cargando...</p>;
  if (!expense) return <p className="p-6 text-red-600">Factura no encontrada</p>;

  return (
    <main className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow mt-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Editar Factura #{id}</h1>

      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Proveedor</label>
          <input
            type="text"
            name="vendor"
            value={form.vendor}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Descripción</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Monto Total</label>
          <input
            type="number"
            name="total"
            value={form.total}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Moneda</label>
          <input
            type="text"
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Categoría</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="">Seleccione una categoría</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md mt-4 transition"
        >
          Guardar Cambios
        </button>
      </div>
    </main>
  );
}
