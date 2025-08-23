import { useQuery } from "@tanstack/react-query";
import { getPerfil } from "../api/alumna.api";
import { useAlumnaId } from "../api/useAlumnaId";

export default function Perfil() {
  const id = useAlumnaId();
  const { data, isLoading, error } = useQuery({
    queryKey: ["perfil", id],
    queryFn: () => getPerfil(id),
  });

  if (isLoading) return <div>Cargando perfil…</div>;
  if (error) return <div>Ocurrió un error al cargar el perfil</div>;

  return (
    <div className="card">
      <div className="font-medium text-lg mb-1">{data?.nombre}</div>
      <div className="opacity-80">{data?.email}</div>
    </div>
  );
}
