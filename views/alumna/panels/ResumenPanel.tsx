import type { AlumnaResumen } from '../../../types/alumna';
import { fmtMoneda } from '../../../utils/format';

export default function ResumenPanel({
  resumen,
  totalPagado,
}: {
  resumen: AlumnaResumen | null;
  totalPagado: number;
}) {
  if (!resumen) {
    // Fallback cuando aún no llega el resumen
    return (
      <section className="rounded-2xl border p-4 bg-white">
        <h2 className="font-semibold mb-2">Resumen</h2>
        <p className="text-sm opacity-70">Cargando resumen…</p>
      </section>
    );
  }

  const nombre = resumen.nombre?.trim() ? resumen.nombre : '—';
  const planesActivos = Number.isFinite(resumen.planesActivos)
    ? resumen.planesActivos
    : 0;
  const clasesTomadas = Number.isFinite(resumen.clasesTomadas)
    ? resumen.clasesTomadas
    : 0;

  return (
    <section className="rounded-2xl border p-4 bg-white">
      <h2 className="font-semibold mb-2">Resumen</h2>
      <ul className="text-sm space-y-1">
        <li>
          <strong>Nombre:</strong> {nombre}
        </li>
        <li>
          <strong>Planes activos:</strong> {planesActivos}
        </li>
        <li>
          <strong>Clases tomadas:</strong> {clasesTomadas}
        </li>
        <li>
          <strong>Total pagado:</strong> {fmtMoneda(totalPagado || 0)}
        </li>
      </ul>
    </section>
  );
}
