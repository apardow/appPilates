import { useQuery } from '@tanstack/react-query';
import { getPlanes } from '../api/alumna.api';
import { useAlumnaId } from '../api/useAlumnaId';

export default function Planes() {
  const id = useAlumnaId();
  const { data, isLoading, error } = useQuery({
    queryKey: ['planes', id],
    queryFn: () => getPlanes(id),
  });

  if (isLoading) return <div>Cargando planes…</div>;
  if (error) return <div>No pudimos cargar planes.</div>;
  if (!data?.length) return <div>No hay planes activos.</div>;

  return (
    <ul className="grid gap-3">
      {data.map((p) => (
        <li key={String(p.cliente_plan_id)} className="card">
          <div className="font-medium">{p.plan_nombre}</div>
          <div className="text-sm opacity-80">
            {p.fecha_inicio} → {p.fecha_fin} · restantes: {p.clases_restantes}
          </div>
        </li>
      ))}
    </ul>
  );
}
