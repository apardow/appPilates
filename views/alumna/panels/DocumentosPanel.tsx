import type { DocumentoAlumna } from "../../../types/alumna";

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
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    await onUpload(e.target.files[0]);
    onRefresh();
  };

  return (
    <section className="rounded-2xl border p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">Documentos</h2>
        <label className="text-xs cursor-pointer">
          <input type="file" className="hidden" onChange={handleUpload} />
          <span className="px-2 py-1 rounded bg-gray-900 text-white">Subir</span>
        </label>
      </div>
      <ul className="text-sm space-y-1">
        {documentos.map(d => (
          <li key={d.id} className="flex items-center justify-between border p-2 rounded">
            <span>{d.nombre}</span>
            <button
              onClick={async () => { await onDelete(d.id); onRefresh(); }}
              className="px-2 py-1 rounded bg-red-600 text-white"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
