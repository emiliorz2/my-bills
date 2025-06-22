//app/page.tsx

import MainContent from "@/components/MainContent";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-gradient-to-br from-gray-100 to-gray-200">
      <section className="max-w-3xl text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-blue-700">
          Bienvenido a tu sistema de facturación
        </h1>
        <p className="text-gray-700 text-lg sm:text-xl mb-10">
          Gestioná tus gastos, visualizá reportes y organizá tus finanzas de manera simple y eficiente.
        </p>
        <MainContent />
      </section>
    </main>
  );
}
