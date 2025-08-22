import type { ActividadAlumna } from "../../../types/alumna";

export default function ActividadesPanel({ actividades }: { actividades: ActividadAlumna[] }) {
  return (
    <section className="rounded-2xl border p-4">
      <h2 className="font-semibold mb-2">Próximas actividades</h2>
      <ul className="text-sm space-y-1">
        {actividades.map(a => (
          <li key={a.id} className="flex items-center justify-between border p-2 rounded">
            <span>{a.nombre} — {a.fecha} {a.hora}</span>
            <span className="opacity-70">{a.sucursal}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
