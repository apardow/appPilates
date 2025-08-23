import { useQuery } from '@tanstack/react-query';
import { getClases } from '../api/alumna.api';
import { useAlumnaId } from '../api/useAlumnaId';

export default function Clases() {
  const id = useAlumnaId();
  const { data, isLoading, error } = useQuery({
    queryKey: ['clases', id],
    queryFn: () => getClases(id),
  });

  if (isLoading) return <div>Cargando clases…</div>;
  if (error) return <div>Ocurrió un error al cargar las clases</div>;

  return (
    <ul className="grid gap-3">
      {data?.map((c) => (
        <li key={c.id} className="card">
          <div className="font-medium">{c.nombre}</div>
          <div className="text-sm opacity-80">
            {c.fecha} — {c.hora} · cupos: {c.cupos}
          </div>
        </li>
      ))}
    </ul>
  );
}
