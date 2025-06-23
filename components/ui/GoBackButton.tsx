//components/ui/GoBackButton.tsx

'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function GoBackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-sm text-primary hover:underline mb-4"
    >
      <ArrowLeft size={16} />
      Volver atrás
    </button>
  );
}
