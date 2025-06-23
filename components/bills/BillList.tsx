'use client';
import { Expense } from '@/src/types/expense';
import BillItem from './BillItem';

interface BillListProps {
  bills: Expense[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function BillList({ bills, onEdit, onDelete }: BillListProps) {
  if (bills.length === 0) {
    return <p className="text-gray-500 text-center">No hay facturas registradas aún.</p>;
  }

  return (
    <ul className="space-y-6">
      {bills.map((bill) => (
        <BillItem key={bill.id} bill={bill} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
}
