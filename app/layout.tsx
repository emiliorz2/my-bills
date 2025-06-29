//app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"
import Providers from '@/components/Providers'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IA-Budget",
  description: "Aplicación de gestión de gastos con IA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} font-sans bg-secondary text-gray-900`}
      >
        <Providers>
          <NavBar />
          <main className="min-h-screen">{children}</main>
        </Providers>
        <ToastContainer/>
      </body>
    </html>
  );
}
