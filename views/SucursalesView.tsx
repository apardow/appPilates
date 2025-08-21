import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RiSearchLine, RiAddLine, RiPencilLine, RiDeleteBinLine } from 'react-icons/ri';

// Interfaz actualizada para incluir la URL de la foto
interface Sucursal {
    id: number;
    nombre: string;
    codigo: string;
    direccion: string;
    habilitado: boolean | number;
    foto_url?: string | null; // La URL de la foto es opcional
}

const SucursalesView: React.FC = () => {
    const [sucursales, setSucursales] = useState<Sucursal[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState<string>('');

    const fetchSucursales = async () => {
        try {
            const response = await fetch('https://api.espaciopilatescl.cl/api/sucursales');
            if (!response.ok) {
                throw new Error('La respuesta de la red no fue exitosa');
            }
            const data: Sucursal[] = await response.json();
            setSucursales(data);
        } catch (err) {
            setError('No se pudo cargar la lista de sucursales.');
            console.error("Error fetching sucursales:", err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        fetchSucursales();
    }, []);
    
    // --- NUEVA FUNCIÓN PARA ELIMINAR ---
    // Se añade la lógica para borrar una sucursal desde esta vista
    const handleEliminar = async (id: number) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta sucursal?')) {
            try {
                const response = await fetch(`https://api.espaciopilatescl.cl/api/sucursales/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'No se pudo eliminar la sucursal.');
                }
                
                // Actualiza la lista de sucursales en el estado para reflejar el cambio
                setSucursales(sucursales.filter(s => s.id !== id));

            } catch (err: any) {
                alert(`Error: ${err.message}`);
            }
        }
    };


    const sucursalesFiltradas = sucursales.filter(s =>
        s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.direccion.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (cargando) return <div className="p-8 text-center">Cargando sucursales...</div>;
    if (error) return <div className="p-8"><div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"><p className="font-bold">Error</p><p>{error}</p></div></div>;

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Sucursales</h1>

             <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                    <div className="relative w-full md:w-auto mb-4 md:mb-0">
                        <RiSearchLine className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
                        <input
                            type="text"
                            className="bg-gray-100 w-full md:w-80 outline-none py-2 px-4 pl-10 rounded-lg"
                            placeholder="Buscar sucursal..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                    <Link 
                        to="/sucursales/nuevo"
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                        <RiAddLine />
                        Agregar Sucursal
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                {/* --- NUEVA COLUMNA PARA LA FOTO --- */}
                                <th scope="col" className="px-6 py-3 w-24">Foto</th>
                                <th scope="col" className="px-6 py-3">Nombre</th>
                                <th scope="col" className="px-6 py-3">Código</th>
                                <th scope="col" className="px-6 py-3">Dirección</th>
                                <th scope="col" className="px-6 py-3 text-center">Estado</th>
                                <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sucursalesFiltradas.length > 0 ? (
                                sucursalesFiltradas.map((sucursal) => (
                                    <tr key={sucursal.id} className="bg-white border-b hover:bg-gray-50">
                                        {/* --- CELDA QUE MUESTRA LA FOTO --- */}
                                        <td className="px-6 py-4">
                                            {sucursal.foto_url ? (
                                                <img 
                                                    src={`https://api.espaciopilatescl.cl${sucursal.foto_url}`} 
                                                    alt={sucursal.nombre}
                                                    className="w-16 h-10 object-cover rounded-md"
                                                />
                                            ) : (
                                                <div className="w-16 h-10 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">Sin foto</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{sucursal.nombre}</td>
                                        <td className="px-6 py-4">{sucursal.codigo}</td>
                                        <td className="px-6 py-4">{sucursal.direccion}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${sucursal.habilitado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {sucursal.habilitado ? 'Habilitado' : 'Deshabilitado'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <Link to={`/sucursales/editar/${sucursal.id}`} className="text-blue-500 hover:text-blue-700"><RiPencilLine size={20} /></Link>
                                                {/* --- BOTÓN DE ELIMINAR ACTUALIZADO --- */}
                                                <button onClick={() => handleEliminar(sucursal.id)} className="text-red-500 hover:text-red-700"><RiDeleteBinLine size={20} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        No hay sucursales para mostrar. Puedes agregar una nueva.
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

export default SucursalesView;
