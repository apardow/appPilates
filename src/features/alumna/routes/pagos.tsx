import { useQuery } from '@tanstack/react-query';
import { getPagos } from '../api/alumna.api';
import { useAlumnaId } from '../api/useAlumnaId';

export default function Pagos() {
  const id = useAlumnaId();
  const { data, isLoading, error } = useQuery({
    queryKey: ['pagos', id],
    queryFn: () => getPagos(id),
  });

  if (isLoading) return <div>Cargando pagos…</div>;
  if (error) return <div>No pudimos cargar pagos.</div>;
  if (!data?.length) return <div>No hay pagos registrados.</div>;

  return (
    <ul className="grid gap-3">
      {data.map((p) => (
        <li key={String(p.pago_id)} className="card">
          <div className="font-medium">${p.monto}</div>
          <div className="text-sm opacity-80">
            {p.pagado_en} · {p.metodo_pago}
          </div>
        </li>
      ))}
    </ul>
  );
}
