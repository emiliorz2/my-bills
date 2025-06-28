import { ReactNode } from 'react';
import NavBar from '@/components/NavBar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <NavBar />
      <main className="w-full max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
        {children}
      </main>
    </>
  );
}
