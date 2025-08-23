import { useQuery } from '@tanstack/react-query';
import { getPerfil } from '../api/alumna.api';
import { useAlumnaId } from '../api/useAlumnaId';

export default function Perfil() {
  const id = useAlumnaId();
  const { data, isLoading, error } = useQuery({
    queryKey: ['perfil', id],
    queryFn: () => getPerfil(id),
  });

  if (isLoading) return <div>Cargando perfil…</div>;
  if (error) return <div>No pudimos cargar el perfil.</div>;
  if (!data) return <div>Perfil no disponible.</div>;

  const nombreCompleto = [data.nombre, data.apellido].filter(Boolean).join(' ');

  return (
    <div className="card">
      <div className="font-medium text-lg mb-1">{nombreCompleto || '—'}</div>
      <div className="opacity-80">{data.email ?? ''}</div>
      {data.telefono ? <div className="opacity-60">{data.telefono}</div> : null}
    </div>
  );
}
