import { useQuery } from '@tanstack/react-query';
import { getReservas } from '../api/alumna.api';
import { useAlumnaId } from '../api/useAlumnaId';

function estadoLabel(e: string | undefined) {
  switch (e) {
    case 'activa':
      return '🟢 activa';
    case 'cancelada_a_tiempo':
      return '🟡 cancelada a tiempo';
    case 'cancelada_tarde':
      return '🟠 cancelada tarde';
    case 'asistida':
      return '🔵 asistida';
    case 'ausente':
      return '⚫ ausente';
    default:
      return e ?? '—';
  }
}

export default function Reservas() {
  const id = useAlumnaId();
  const { data, isLoading, error } = useQuery({
    queryKey: ['reservas', id],
    queryFn: () => getReservas(id),
  });

  if (isLoading) return <div>Cargando reservas…</div>;
  if (error) return <div>No pudimos cargar reservas.</div>;
  if (!data?.length) return <div>No hay reservas.</div>;

  return (
    <ul className="grid gap-3">
      {data.map((r) => (
        <li key={String(r.id)} className="card">
          <div className="font-medium">
            Reserva #{String(r.id)} — {estadoLabel(r.estado)}
          </div>
          <div className="text-sm opacity-80">
            Clase: {String(r.clase_id)}
            {r.cancelada_en ? ` · cancelada en: ${r.cancelada_en}` : ''}
            {r.created_at ? ` · creada: ${r.created_at}` : ''}
          </div>
        </li>
      ))}
    </ul>
  );
}
