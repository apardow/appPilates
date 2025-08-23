import { useQuery } from "@tanstack/react-query";
import { getPlanes } from "../api/alumna.api";
import { useAlumnaId } from "../api/useAlumnaId";

export default function Planes() {
  const id = useAlumnaId();
  const { data, isLoading, error } = useQuery({
    queryKey: ["planes", id],
    queryFn: () => getPlanes(id),
  });

  if (isLoading) return <div>Cargando planes…</div>;
  if (error) return <div>Ocurrió un error al cargar los planes</div>;

  return (
    <ul className="grid gap-3">
      {data?.map((p) => (
        <li key={p.id} className="card">
          <div className="font-medium">{p.nombre}</div>
          <div className="text-sm opacity-80">
            Válido hasta: {p.vigenciaHasta} · Créditos: {p.creditos}
          </div>
        </li>
      ))}
    </ul>
  );
}
