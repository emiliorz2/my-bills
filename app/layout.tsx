import './globals.css';
import type { ReactNode } from 'react';

export const metadata = { title: 'My-Bills', description: 'AI Bills Tracker' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans bg-secondary text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
