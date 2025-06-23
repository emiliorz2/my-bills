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
    <main className="relative min-h-screen px-4 py-10 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('/globe.svg')] bg-repeat" />
      <section className="relative max-w-xl mx-auto z-10 bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary text-center mb-4">Editar Factura #{id}</h1>

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
          className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-md mt-4 transition"
        >
          Guardar Cambios
        </button>
      </div>
      </section>
    </main>
  );
}
