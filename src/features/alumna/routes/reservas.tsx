import { useQuery } from "@tanstack/react-query";
import { getReservas } from "../api/alumna.api";

export default function Reservas() {
  const { data, isLoading, error } = useQuery({ queryKey: ["reservas"], queryFn: getReservas });

  if (isLoading) return <div>Cargando reservas…</div>;
  if (error) return <div>Ocurrió un error al cargar las reservas</div>;

  return (
    <ul className="grid gap-3">
      {data?.map((r) => (
        <li key={r.id} className="card">
          <div className="font-medium">Reserva #{r.id}</div>
          <div className="text-sm opacity-80">
            Clase: {String(r.claseId)} — Estado: {r.estado}
          </div>
        </li>
      ))}
    </ul>
  );
}
