import type { AlumnaResumen } from "../../../types/alumna";

export default function ResumenPanel({
  resumen,
  totalPagado,
}: {
  resumen: AlumnaResumen | null;
  totalPagado: number;
}) {
  if (!resumen) return null;
  return (
    <section className="rounded-2xl border p-4">
      <h2 className="font-semibold mb-2">Resumen</h2>
      <ul className="text-sm space-y-1">
        <li><strong>Nombre:</strong> {resumen.nombre}</li>
        <li><strong>Planes activos:</strong> {resumen.planesActivos}</li>
        <li><strong>Clases tomadas:</strong> {resumen.clasesTomadas}</li>
        <li><strong>Total pagado:</strong> {new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP'}).format(totalPagado)}</li>
      </ul>
    </section>
  );
}
