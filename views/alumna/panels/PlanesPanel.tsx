import type { PlanAlumna } from "../../../types/alumna";
import { fmtDia } from "../../../utils/format";
import { BadgePlan } from "../../../components/common/StatusBadges";

export default function PlanesPanel({ planes }: { planes: PlanAlumna[] }) {
  return (
    <section className="rounded-2xl border p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">Planes</h2>
      </div>

      {planes.length === 0 ? (
        <p className="text-sm opacity-70">No hay planes asignados.</p>
      ) : (
        <div className="space-y-2">
          {planes.map((p) => {
            const label =
              p.nombre && p.nombre !== "(sin nombre)"
                ? p.nombre
                : `Plan #${p.id ?? "-"}`;

            return (
              <div
                key={p.id}
                className="text-sm flex items-center justify-between border p-2 rounded"
              >
                <div>
                  <div className="font-medium">{label}</div>
                  <div className="opacity-70">
                    Clases: {p.clasesTotales ?? 0} · Usadas: {p.clasesUsadas ?? 0}
                    {" · Vence: "}
                    {p.vencimiento ? fmtDia(p.vencimiento) : "—"}
                  </div>
                </div>
                <BadgePlan estado={p.estado} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
