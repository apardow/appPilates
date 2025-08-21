
import { useState } from "react";
import { format } from "date-fns";
import { fmtDia } from "../../utils/format";
import { toCsv, downloadCsv } from "../../utils/csv";
import {
  getDocumentos,
  uploadClienteDocumento,
  deleteClienteDocumento,
} from "../../data/alumnaApi";
import type { DocumentoAlumna } from "../../types/alumna";

type Props = {
  clienteId: number;
};

export default function DocumentsTab({ clienteId }: Props) {
  // Lista
  const [docs, setDocs] = useState<DocumentoAlumna[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Filtros
  const [tipoFilter, setTipoFilter] = useState("");
  const [limit, setLimit] = useState(20);

  // Form
  const [nombre, setNombre] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [tipoForm, setTipoForm] = useState("");

  async function fetchDocs() {
    try {
      setLoading(true);
      setErr(null);
      const data = await getDocumentos(clienteId, {
        tipo: tipoFilter || undefined,
        limit: limit || undefined,
      });
      setDocs(data);
    } catch (e: any) {
      setErr(e?.message ?? "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-end">
        <label className="text-sm">
          Tipo
          <input
            type="text"
            placeholder="certificado, apto, etc."
            className="block border rounded px-2 py-1 mt-1"
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
          />
        </label>
        <label className="text-sm">
          Límite
          <input
            type="number"
            min={1}
            className="block border rounded px-2 py-1 mt-1 w-24"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value || 0))}
          />
        </label>
        <button
          className="px-3 py-2 border rounded"
          onClick={fetchDocs}
        >
          Aplicar
        </button>

        {docs && docs.length > 0 && (
          <button
            className="px-3 py-2 border rounded"
            onClick={() => {
              const rows = docs.map(d => ({
                nombre: d.nombre_documento,
                tipo: d.tipo ?? "",
                emitido_el: d.emitido_el ? fmtDia(d.emitido_el) : "",
                vence_el: d.vence_el ? fmtDia(d.vence_el) : "",
                actualizado: d.updated_at ? format(new Date(d.updated_at), "dd-MM-yyyy HH:mm") : "",
                url: d.url_documento,
              }));
              const csv = toCsv(rows);
              downloadCsv(`documentos_cliente_${clienteId}.csv`, csv);
            }}
          >
            Exportar CSV
          </button>
        )}
      </div>

      {/* Form subir documento */}
      <div className="mt-2 p-3 border rounded-lg flex flex-wrap items-end gap-3 bg-white">
        <label className="text-sm">
          Nombre
          <input
            type="text"
            className="block border rounded px-2 py-1 mt-1"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Certificado médico"
          />
        </label>
        <label className="text-sm">
          Archivo
          <input
            type="file"
            accept="application/pdf,image/*"
            className="block border rounded px-2 py-1 mt-1"
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          />
        </label>
        <label className="text-sm">
          Tipo (opcional)
          <input
            type="text"
            className="block border rounded px-2 py-1 mt-1"
            value={tipoForm}
            onChange={(e) => setTipoForm(e.target.value)}
            placeholder="certificado_medico"
          />
        </label>
        <button
          type="button"
          className="px-3 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
          onClick={async () => {
            if (!nombre || !archivo) {
              alert("Nombre y archivo son obligatorios"); return;
            }
            try {
              setLoading(true);
              await uploadClienteDocumento(clienteId, {
                nombre_documento: nombre,
                archivo,
                tipo: tipoForm || undefined,
              });
              await fetchDocs();
              setNombre(""); setArchivo(null); setTipoForm("");
            } catch (e: any) {
              alert(e?.message ?? "No se pudo subir el documento");
            } finally {
              setLoading(false);
            }
          }}
        >
          Subir
        </button>
      </div>

      {/* Lista */}
      {loading && <div>Cargando documentos…</div>}
      {err && <div className="text-red-600">Error: {err}</div>}
      {docs?.length === 0 && <div>Sin documentos.</div>}

      {docs?.map((d) => (
        <div key={d.documento_id} className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
          <div>
            <div className="font-semibold">{d.nombre_documento}</div>
            <div className="text-sm text-gray-600">
              {(d.tipo ?? "—") + " • emitido: " + (d.emitido_el ? fmtDia(d.emitido_el) : "—") + " • vence: " + (d.vence_el ? fmtDia(d.vence_el) : "—")}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={d.url_documento}
              target="_blank"
              rel="noreferrer"
              className="text-sm underline"
            >
              Ver
            </a>
            <button
              type="button"
              className="text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50"
              onClick={async () => {
                if (!confirm("¿Eliminar este documento?")) return;
                try {
                  setLoading(true);
                  await deleteClienteDocumento(clienteId, d.documento_id as any);
                  await fetchDocs();
                } catch (e: any) {
                  alert(e?.message ?? "No se pudo eliminar el documento");
                } finally {
                  setLoading(false);
                }
              }}
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
