import useSWR from 'swr';
import { Expense } from '@/src/types/expense';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function useBills() {
  const { data, error, isLoading, mutate } = useSWR('/api/expenses', fetcher);

  const deleteBill = async (id: number) => {
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete bill');
    mutate();
  };

  return {
    bills: (data?.data as Expense[]) || [],
    error,
    isLoading,
    deleteBill,
    mutate,
  };
}
