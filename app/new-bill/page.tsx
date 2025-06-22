//app/new-bill/page.tsx

'use client';

import { useState, DragEvent } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import GoBackButton from '@/components/ui/GoBackButton';

export default function NewBillPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState('');

  const router = useRouter();

  const handleFileChange = (file: File | null) => {
    setFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/processBill/bill-photo', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      toast.success('✅ Imagen procesada correctamente.');
      URL.revokeObjectURL(previewUrl!);
      setFile(null);
      setPreviewUrl(null);
      router.push('/bills');
    } else {
      toast.error(data.error || '❌ Error al procesar la imagen.');
    }
  };

  const handleSubmitText = async () => {
    if (!textInput.trim()) return;

    setLoading(true);

    const res = await fetch('/api/processBill/text', {
      method: 'POST',
      body: JSON.stringify({ message: textInput }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      toast.success('✅ Gasto registrado correctamente.');
      setTextInput('');
      router.push('/bills');
    } else {
      toast.error('❌ Error al registrar el gasto.');
    }
  };

  const containerClass =
    'max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md flex flex-col gap-6';

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className={containerClass}>
        <GoBackButton />

        <h1 className="text-2xl font-bold text-blue-700 text-center">
          Registrar Factura
        </h1>

        {/* Entrada de texto */}
        <div>
          <h2 className="font-semibold text-gray-800 mb-2">Registrar por texto</h2>
          <textarea
            rows={4}
            placeholder="Ej: 5000 colones a pulpería"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <button
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded"
            onClick={handleSubmitText}
            disabled={loading || !textInput.trim()}
          >
            {loading ? 'Procesando...' : 'Procesar texto'}
          </button>
        </div>

        {/* Subida o arrastre de imagen */}
        <div>
          <h2 className="font-semibold text-gray-800 mb-2">Subir o arrastrar imagen</h2>
          <div
            className={`w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
              dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            {file ? (
              <p className="text-sm text-gray-600">
                Archivo seleccionado: <strong>{file.name}</strong>
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Arrastra una imagen aquí o haz clic para seleccionar
              </p>
            )}
          </div>

          {previewUrl && (
            <div className="mt-3 text-center">
              <p className="text-sm text-gray-600 mb-1">Vista previa:</p>
              <img
                src={previewUrl}
                alt="Vista previa de la factura"
                className="max-h-48 mx-auto rounded border"
              />
            </div>
          )}

          <input
            id="fileInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          />

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`mt-3 w-full px-4 py-2 rounded text-white font-medium transition ${
              loading || !file
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Procesando...' : 'Subir y procesar'}
          </button>
        </div>
      </div>
    </main>
  );
}
