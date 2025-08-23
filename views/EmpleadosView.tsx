import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  RiSearchLine,
  RiAddLine,
  RiPencilLine,
  RiDeleteBinLine,
  RiEyeLine,
} from 'react-icons/ri';

// Interfaz para la estructura de datos de un Empleado
interface Empleado {
  id: number;
  nombre: string;
  apellido_paterno: string;
  codigo_empleado: string;
  direccion_completa: string;
  habilitado: boolean | number;
  // Podríamos añadir más campos si la API los devuelve en la lista
}

const EmpleadosView: React.FC = () => {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>('');

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const response = await fetch(
          'https://api.espaciopilatescl.cl/api/empleados',
        );
        if (!response.ok)
          throw new Error('No se pudo obtener la lista de empleados.');
        const data: Empleado[] = await response.json();
        setEmpleados(data);
      } catch (err) {
        setError('Ocurrió un error al cargar los datos.');
        console.error('Error fetching empleados:', err);
      } finally {
        setCargando(false);
      }
    };
    fetchEmpleados();
  }, []);

  const empleadosFiltrados = empleados.filter((e) =>
    `${e.nombre} ${e.apellido_paterno}`
      .toLowerCase()
      .includes(busqueda.toLowerCase()),
  );

  if (cargando)
    return <div className="p-8 text-center">Cargando empleados...</div>;
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
        Gestión de Empleados
      </h1>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="relative w-full md:w-auto mb-4 md:mb-0">
            <RiSearchLine className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
            <input
              type="text"
              className="bg-gray-100 w-full md:w-80 outline-none py-2 px-4 pl-10 rounded-lg"
              placeholder="Buscar empleado..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <Link
            to="/empleados/nuevo"
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RiAddLine />
            Agregar Empleado
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
                  Código Empleado
                </th>
                <th scope="col" className="px-6 py-3">
                  Dirección
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
              {empleadosFiltrados.map((empleado) => (
                <tr
                  key={empleado.id}
                  className="bg-white border-b hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {empleado.nombre} {empleado.apellido_paterno}
                  </td>
                  <td className="px-6 py-4">{empleado.codigo_empleado}</td>
                  <td className="px-6 py-4">{empleado.direccion_completa}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${empleado.habilitado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {empleado.habilitado ? 'Habilitado' : 'Deshabilitado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center gap-3">
                      {/* --- ICONO DE OJO AÑADIDO --- */}
                      <Link
                        to={`/empleados/editar/${empleado.id}`}
                        className="text-gray-500 hover:text-gray-700"
                        title="Ver Detalle"
                      >
                        <RiEyeLine size={20} />
                      </Link>
                      <Link
                        to={`/empleados/editar/${empleado.id}`}
                        className="text-blue-500 hover:text-blue-700"
                        title="Editar Empleado"
                      >
                        <RiPencilLine size={20} />
                      </Link>
                      <button
                        className="text-red-500 hover:text-red-700"
                        title="Eliminar Empleado"
                      >
                        <RiDeleteBinLine size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmpleadosView;
