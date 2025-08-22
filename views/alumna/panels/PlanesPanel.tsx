import type { PlanAlumna } from "../../../types/alumna";

export default function PlanesPanel({ planes }: { planes: PlanAlumna[] }) {
  return (
    <section className="rounded-2xl border p-4">
      <h2 className="font-semibold mb-2">Planes</h2>
      <div className="space-y-2">
        {planes.map(p => (
          <div key={p.id} className="text-sm flex items-center justify-between border p-2 rounded">
            <div>
              <div className="font-medium">{p.nombre}</div>
              <div className="opacity-70">Clases: {p.clasesTotales} · Vence: {p.vencimiento}</div>
            </div>
            <div className="opacity-70">{p.estado}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
