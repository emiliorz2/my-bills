'use client';
import { Expense } from '@/src/types/expense';
import { formatDateSafe } from '@/src/utils';

interface BillItemProps {
  bill: Expense;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function BillItem({ bill, onEdit, onDelete }: BillItemProps) {
  return (
    <li className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-800">
          {bill.vendor || 'Proveedor desconocido'}
        </h2>
        <span className="text-sm text-gray-500">{formatDateSafe(bill.date)}</span>
      </div>

      <p className="text-gray-700">{bill.description}</p>

      {bill.category && (
        <p className="text-sm text-blue-600 font-medium mt-1">Categoría: {bill.category}</p>
      )}

      <p className="text-xl font-bold text-green-600 mt-3">
        {bill.total.toLocaleString('es-CR', { style: 'currency', currency: bill.currency })}
      </p>

      <p className="text-sm text-gray-500 mt-1">
        Origen: <span className="italic">{bill.source.type}</span>
        {bill.source.description && ` (${bill.source.description})`}
      </p>

      {bill.expenseType === 'invoice' && bill.invoiceDetails.length > 0 && (
        <div className="mt-4 bg-gray-50 p-3 rounded-md border">
          <p className="font-semibold mb-1 text-sm text-gray-700">Detalles de factura:</p>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            {bill.invoiceDetails.map((item, idx) => (
              <li key={idx}>
                {item.quantity} x {item.product} @{' '}
                {item.unitPrice.toLocaleString('es-CR', { style: 'currency', currency: bill.currency })}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onEdit(bill.id)}
          className="px-4 py-2 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600 transition"
        >
          Modificar
        </button>
        <button
          onClick={() => onDelete(bill.id)}
          className="px-4 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition"
        >
          Eliminar
        </button>
      </div>
    </li>
  );
}
