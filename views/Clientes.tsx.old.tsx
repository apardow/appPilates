import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RiSearchLine, RiAddLine, RiEyeLine, RiPencilLine, RiDeleteBinLine } from 'react-icons/ri';

// --- Interfaz Actualizada ---
// Ahora esperamos un objeto 'usuario' anidado que contenga el email.
interface Cliente {
    id: number;
    nombre: string;
    apellido: string;
    telefono: string | null;
    usuario: {
        email: string;
    };
    // Agrega aquí cualquier otro campo que venga de tu API
}

const Clientes: React.FC = () => {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState<string>('');

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const response = await fetch('https://api.espaciopilatescl.cl/api/clientes');
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                const data: Cliente[] = await response.json();
                setClientes(data);
            } catch (err) {
                console.error("Error al obtener los datos de clientes:", err);
                setError("No se pudo cargar la lista de clientes. Revisa la conexión con la API.");
            } finally {
                setCargando(false);
            }
        };
        fetchClientes();
    }, []);

    const clientesFiltrados = clientes.filter(cliente =>
        `${cliente.nombre} ${cliente.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
        (cliente.usuario && cliente.usuario.email.toLowerCase().includes(busqueda.toLowerCase()))
    );

    if (cargando) {
        return <div className="p-8 text-center text-gray-500">Cargando clientes...</div>;
    }

    if (error) {
        return <div className="p-8"><div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"><p className="font-bold">Error</p><p>{error}</p></div></div>;
    }

    return (
        <div className="p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Columna Izquierda (Resumen) */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-md mb-6 text-center">
                        <h2 className="text-5xl font-bold text-gray-800">{clientesFiltrados.length}</h2>
                        <p className="text-gray-500 mt-2">Usuarios encontrados</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="font-bold text-gray-800 mb-4">Más recientes...</h3>
                        <ul className="space-y-3">
                            {clientes.slice(0, 5).map(c => (
                                <li key={c.id} className="text-sm text-gray-600">{c.nombre} {c.apellido}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Columna Derecha (Tabla Principal) */}
                <div className="lg:col-span-3">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                            <div className="relative w-full md:w-auto mb-4 md:mb-0">
                                <RiSearchLine className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
                                <input
                                    type="text"
                                    className="bg-gray-100 w-full md:w-80 outline-none py-2 px-4 pl-10 rounded-lg"
                                    placeholder="Buscar cliente..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            </div>
                            <Link 
                                to="/clientes/nuevo"
                                className="w-full md:w-auto flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                                <RiAddLine />
                                Agregar Cliente
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Nombre</th>
                                        <th scope="col" className="px-6 py-3">Apellido</th>
                                        <th scope="col" className="px-6 py-3">Correo</th>
                                        <th scope="col" className="px-6 py-3">Teléfono</th>
                                        <th scope="col" className="px-6 py-3 text-center">Estado</th>
                                        <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientesFiltrados.map((cliente) => (
                                        <tr key={cliente.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{cliente.nombre}</td>
                                            <td className="px-6 py-4">{cliente.apellido}</td>
                                            {/* --- CAMBIO CLAVE --- */}
                                            <td className="px-6 py-4">{cliente.usuario?.email || 'N/A'}</td>
                                            <td className="px-6 py-4">{cliente.telefono || 'N/A'}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Activo</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Link to={`/clientes/editar/${cliente.id}`} className="text-blue-500 hover:text-blue-700"><RiPencilLine size={20} /></Link>
                                                    <button className="text-red-500 hover:text-red-700"><RiDeleteBinLine size={20} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Clientes;
