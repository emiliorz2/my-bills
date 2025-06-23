//app/page.tsx

import MainContent from "@/components/MainContent";

export default function Home() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('/globe.svg')] bg-repeat" />
      <section className="relative max-w-3xl text-center space-y-6 z-10">
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-primary">
            {/* TODO: reemplazar con nombre de usuario autenticado */}
            Hola, Manuel Rojas <span className="inline-block">👋</span>
          </h1>
          <p className="text-gray-700 text-lg sm:text-xl">
            Gastos este mes: ₡125,300 · Top proveedor: Walmart
          </p>
        </div>
        <MainContent />
      </section>
    </main>
  );
}
