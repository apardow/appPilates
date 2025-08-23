import { useState } from 'react';
import type { DocumentoAlumna } from '../../../types/alumna';

export default function DocumentosPanel({
  documentos,
  onUpload,
  onDelete,
  onRefresh,
}: {
  documentos: DocumentoAlumna[];
  onUpload: (file: File, alumnaId?: string) => Promise<void>;
  onDelete: (docId: string, alumnaId?: string) => Promise<void>;
  onRefresh: () => void;
}) {
  const [subiendo, setSubiendo] = useState(false);
  const [borrando, setBorrando] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setSubiendo(true);
    try {
      await onUpload(e.target.files[0]);
      onRefresh();
    } finally {
      setSubiendo(false);
      e.currentTarget.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    setBorrando(id);
    try {
      await onDelete(id);
      onRefresh();
    } finally {
      setBorrando(null);
    }
  };

  return (
    <section className="rounded-2xl border p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">Documentos</h2>
        <label className="text-xs cursor-pointer">
          <input type="file" className="hidden" onChange={handleUpload} />
          <span
            className={`px-2 py-1 rounded text-white ${subiendo ? 'bg-gray-400' : 'bg-gray-900'}`}
          >
            {subiendo ? 'Subiendo…' : 'Subir'}
          </span>
        </label>
      </div>

      {documentos.length === 0 ? (
        <p className="text-sm opacity-70">Aún no hay documentos.</p>
      ) : (
        <ul className="text-sm space-y-1">
          {documentos.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between border p-2 rounded"
            >
              <div className="truncate max-w-[24rem]">
                {d.url ? (
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2 hover:opacity-80"
                    title={d.nombre}
                  >
                    {d.nombre || '(Documento)'}
                  </a>
                ) : (
                  <span title={d.nombre}>{d.nombre || '(Documento)'}</span>
                )}
              </div>

              <button
                onClick={() => handleDelete(d.id)}
                className="px-2 py-1 rounded bg-red-600 text-white disabled:opacity-60"
                disabled={borrando === d.id}
              >
                {borrando === d.id ? 'Eliminando…' : 'Eliminar'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
