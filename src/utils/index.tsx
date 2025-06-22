//src/utils/index.tsx

export function formatDateSafe(dateString: string) {
  if (typeof window === 'undefined') return dateString; // evitar formateo en SSR
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CR');
}