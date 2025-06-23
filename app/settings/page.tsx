'use client';

import GoBackButton from '@/components/ui/GoBackButton';

export default function SettingsPage() {
  const suggestions = [
    'Actualizar datos personales',
    'Preferencias de notificación',
    'Moneda predeterminada y formato de números',
    'Categorías de gastos personalizadas',
    'Configuración de idioma y región',
    'Opciones de seguridad y autenticación',
    'Exportación o respaldo de datos',
    'Integraciones con otros servicios',
    'Apariencia o tema de la aplicación',
    'Eliminar cuenta o limpiar datos',
  ];

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <GoBackButton />
      <h1 className="text-3xl font-bold text-primary">Configuración</h1>
      <p className="text-gray-700">
        A continuación se muestran algunas ideas de ajustes que podrías incluir
        en tu aplicación para mejorar la experiencia de usuario:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-gray-800">
        {suggestions.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="text-sm text-gray-500">
        Este apartado es solo una sugerencia inicial. Ajusta o extiende estas
        opciones según las necesidades específicas de tu proyecto.
      </p>
    </main>
  );
}