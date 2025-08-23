import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RiAddLine, RiPencilLine, RiDeleteBinLine } from 'react-icons/ri';

// Interfaz para la estructura de un Método de Pago
interface MetodoPago {
  id: number;
  nombre: string;
  descripcion: string;
  habilitado: boolean | number;
}

const PagosView: React.FC = () => {
  const [metodos, setMetodos] = useState<MetodoPago[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetodosPago = async () => {
      try {
        const response = await fetch(
          'https://api.espaciopilatescl.cl/api/metodos-pago',
        );
        if (!response.ok)
          throw new Error('No se pudo obtener la lista de métodos de pago.');
        const data: MetodoPago[] = await response.json();
        setMetodos(data);
      } catch (err) {
        setError('Ocurrió un error al cargar los datos.');
        console.error('Error fetching metodos de pago:', err);
      } finally {
        setCargando(false);
      }
    };
    fetchMetodosPago();
  }, []);

  if (cargando)
    return <div className="p-8 text-center">Cargando métodos de pago...</div>;
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Métodos de Pago</h1>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-end items-center mb-4">
          <Link
            to="/pagos/nuevo"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RiAddLine />
            Agregar Método de Pago
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
                  Descripción
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
              {metodos.map((metodo) => (
                <tr
                  key={metodo.id}
                  className="bg-white border-b hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {metodo.nombre}
                  </td>
                  <td className="px-6 py-4">{metodo.descripcion}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${metodo.habilitado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {metodo.habilitado ? 'Habilitado' : 'Deshabilitado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <Link
                        to={`/pagos/editar/${metodo.id}`}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <RiPencilLine size={20} />
                      </Link>
                      <button className="text-red-500 hover:text-red-700">
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

export default PagosView;
