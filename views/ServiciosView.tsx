import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// --- ICONOS LOCALES (para no usar lucide-react) ---
const PlusCircle: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
);

const Edit: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const Trash2: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);


// Interfaz para definir la estructura de un Servicio
interface Servicio {
    id: number;
    nombre: string;
    descripcion: string;
}

const ServiciosView: React.FC = () => {
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Efecto para cargar los servicios desde la API al montar el componente
    useEffect(() => {
        const fetchServicios = async () => {
            try {
                const response = await fetch('https://api.espaciopilatescl.cl/api/servicios');
                if (!response.ok) {
                    throw new Error('No se pudo obtener la lista de servicios.');
                }
                const data = await response.json();
                setServicios(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        };

        fetchServicios();
    }, []);

    // Función para manejar la eliminación de un servicio
    const handleEliminar = async (id: number) => {
        // Usamos una confirmación nativa del navegador para seguridad
        if (window.confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
            try {
                const response = await fetch(`https://api.espaciopilatescl.cl/api/servicios/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    // Si el backend devuelve un error (ej: servicio en uso), lo mostramos
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'No se pudo eliminar el servicio.');
                }

                // Si se elimina con éxito, actualizamos la lista en el estado
                setServicios(servicios.filter(s => s.id !== id));

            } catch (err: any) {
                // Mostramos el error al usuario
                alert(`Error: ${err.message}`);
            }
        }
    };

    if (cargando) return <div className="p-8 text-center">Cargando servicios...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Servicios</h1>
                <Link
                    to="/servicios/nuevo"
                    className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                    <PlusCircle size={20} />
                    Nuevo Servicio
                </Link>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="py-3 px-4 font-semibold text-gray-600">Nombre</th>
                            <th className="py-3 px-4 font-semibold text-gray-600 hidden md:table-cell">Descripción</th>
                            <th className="py-3 px-4 font-semibold text-gray-600 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {servicios.map((servicio) => (
                            <tr key={servicio.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4">{servicio.nombre}</td>
                                <td className="py-3 px-4 text-gray-500 hidden md:table-cell">{servicio.descripcion}</td>
                                <td className="py-3 px-4 flex justify-end gap-3">
                                    <Link to={`/servicios/editar/${servicio.id}`}>
                                        <Edit size={20} className="text-blue-500 hover:text-blue-700" />
                                    </Link>
                                    <button onClick={() => handleEliminar(servicio.id)}>
                                        <Trash2 size={20} className="text-red-500 hover:text-red-700" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {servicios.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No hay servicios registrados.</p>
                )}
            </div>
        </div>
    );
};

export default ServiciosView;
