import type { ActividadAlumna } from '../../../types/alumna';
import { fmtDia, fmtHora } from '../../../utils/format';
import { BadgeActividad } from '../../../components/common/StatusBadges';

export default function ActividadesPanel({
  actividades,
}: {
  actividades: ActividadAlumna[];
}) {
  return (
    <section className="rounded-2xl border p-4 bg-white">
      <h2 className="font-semibold mb-2">Próximas actividades</h2>

      {actividades.length === 0 ? (
        <p className="text-sm opacity-70">No hay actividades próximas.</p>
      ) : (
        <ul className="text-sm space-y-1">
          {actividades.map((a) => {
            const label =
              a.nombre && a.nombre !== '(sin nombre)'
                ? a.nombre
                : `Actividad #${a.id ?? '-'}`;

            const fechaTxt = a.fecha ? fmtDia(a.fecha) : '—';
            const horaTxt = a.hora ? fmtHora(a.hora) : '—';
            const sucTxt = a.sucursal || '—';

            return (
              <li
                key={a.id}
                className="flex items-center justify-between border p-2 rounded"
              >
                <div>
                  <div className="font-medium">{label}</div>
                  <div className="opacity-70">
                    {fechaTxt} · {horaTxt} · {sucTxt}
                  </div>
                </div>
                <BadgeActividad estado={a.estado} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
