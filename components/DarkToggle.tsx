'use client';
import { useEffect, useState } from 'react';

export default function DarkToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (enabled) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [enabled]);

  return (
    <button onClick={() => setEnabled(!enabled)} className="p-2 text-sm">
      {enabled ? '☀️' : '🌙'}
    </button>
  );
}
