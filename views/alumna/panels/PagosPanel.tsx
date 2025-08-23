import type { PagoAlumna } from "../../../types/alumna";
import { fmtMoneda, fmtDia } from "../../../utils/format";
import { toCsv, downloadCsv } from "../../../utils/csv";

export default function PagosPanel({ pagos }: { pagos: PagoAlumna[] }) {
  const exportarCSV = () => {
    const rows = pagos.map(p => ({
      id: p.id,
      fecha: p.fecha ? fmtDia(p.fecha) : "",
      monto: p.monto ?? 0,
      metodo: p.metodo ?? "",
      nota: p.nota ?? "",
    }));
    const csv = toCsv(rows);
    downloadCsv(csv, "pagos_alumna.csv");
  };

  return (
    <section className="rounded-2xl border p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">Pagos</h2>
        <button
          onClick={exportarCSV}
          className="text-xs px-2 py-1 rounded bg-gray-900 text-white"
          disabled={pagos.length === 0}
          title={pagos.length ? "Descargar CSV" : "Sin datos para exportar"}
        >
          Exportar CSV
        </button>
      </div>

      {pagos.length === 0 ? (
        <p className="text-sm opacity-70">Sin pagos registrados.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-left opacity-70">
            <tr><th>Fecha</th><th>Monto</th><th>Método</th><th>Nota</th></tr>
          </thead>
          <tbody>
            {pagos.map(p => (
              <tr key={p.id} className="border-t">
                <td>{p.fecha ? fmtDia(p.fecha) : "—"}</td>
                <td>{fmtMoneda(p.monto ?? 0)}</td>
                <td>{p.metodo ?? "—"}</td>
                <td className="max-w-[22rem] truncate" title={p.nota ?? ""}>{p.nota ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
