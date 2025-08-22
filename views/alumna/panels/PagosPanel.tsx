import type { PagoAlumna } from "../../../types/alumna";

export default function PagosPanel({ pagos }: { pagos: PagoAlumna[] }) {
  return (
    <section className="rounded-2xl border p-4">
      <h2 className="font-semibold mb-2">Pagos</h2>
      <table className="w-full text-sm">
        <thead className="text-left opacity-70">
          <tr><th>Fecha</th><th>Monto</th><th>Método</th></tr>
        </thead>
        <tbody>
          {pagos.map(p => (
            <tr key={p.id} className="border-t">
              <td>{p.fecha}</td>
              <td>{new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP'}).format(p.monto ?? 0)}</td>
              <td>{p.metodo ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
