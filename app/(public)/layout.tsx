import { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <main className="min-h-screen flex items-center justify-center bg-gray-100">{children}</main>;
}
