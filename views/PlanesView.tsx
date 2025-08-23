import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RiSearchLine,
  RiAddLine,
  RiPencilLine,
  RiDeleteBinLine,
} from 'react-icons/ri';

// --- Definición de Tipos ---
interface Plan {
  id: number;
  nombre: string;
  precio: number;
  duracion_dias: number;
  cantidad_clases: number;
  habilitado: boolean | number;
}

const API_BASE_URL = 'https://api.espaciopilatescl.cl/api';

const PlanesView: React.FC = () => {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>('');

  const fetchPlanes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/planes`);
      if (!response.ok) {
        throw new Error('La respuesta de la red no fue exitosa');
      }
      const data: Plan[] = await response.json();
      setPlanes(data);
    } catch (err) {
      setError('No se pudo cargar la lista de planes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanes();
  }, []);

  const handleDelete = async (id: number) => {
    // En una aplicación real, aquí iría un modal de confirmación.
    // Por ahora, procedemos directamente para probar la funcionalidad.
    try {
      const response = await fetch(`${API_BASE_URL}/planes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('No se pudo eliminar el plan.');
      }
      // Actualiza la lista de planes en el estado para reflejar el cambio
      setPlanes(planes.filter((plan) => plan.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ocurrió un error al eliminar',
      );
    }
  };

  const planesFiltrados = planes.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  if (loading) return <div className="p-8 text-center">Cargando planes...</div>;
  if (error)
    return (
      <div className="p-8">
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md"
          role="alert"
        >
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Gestión de Planes
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="relative w-full md:w-auto mb-4 md:mb-0">
            <RiSearchLine className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
            <input
              type="text"
              className="bg-gray-100 w-full md:w-80 outline-none py-2 px-4 pl-10 rounded-lg"
              placeholder="Buscar plan..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <Link
            to="/planes/nuevo"
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RiAddLine />
            Agregar Plan
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3">
                  Duración
                </th>
                <th scope="col" className="px-6 py-3">
                  Clases
                </th>
                <th scope="col" className="px-6 py-3">
                  Precio
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {planesFiltrados.length > 0 ? (
                planesFiltrados.map((plan) => (
                  <tr
                    key={plan.id}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {plan.nombre}
                    </td>
                    <td className="px-6 py-4">{plan.duracion_dias} días</td>
                    <td className="px-6 py-4">{plan.cantidad_clases}</td>
                    <td className="px-6 py-4">
                      ${new Intl.NumberFormat('es-CL').format(plan.precio)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${plan.habilitado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {plan.habilitado ? 'Habilitado' : 'Deshabilitado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Link
                          to={`/planes/editar/${plan.id}`}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <RiPencilLine size={20} />
                        </Link>
                        <button
                          onClick={() => handleDelete(plan.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <RiDeleteBinLine size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No hay planes para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlanesView;
