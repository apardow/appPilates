import React, { useState, useEffect } from 'react';
import { RiStarSFill, RiStarSLine } from 'react-icons/ri';

// --- Interfaces para los datos que vamos a manejar ---
interface Calificacion {
    id: number;
    calificacion: number;
    comentario: string;
    // Asumimos que la API nos devolverá objetos anidados con la información relacionada
    sucursal: { nombre: string };
    empleado: { nombre: string, apellido_paterno: string };
    cliente: { nombre: string, apellido: string };
    servicio: { nombre: string }; // Suponiendo que hay una tabla de servicios
    created_at: string;
}

interface Sucursal {
    id: number;
    nombre: string;
}

interface Empleado {
    id: number;
    nombre: string;
    apellido_paterno: string;
}

// Componente para renderizar las estrellas de calificación
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    const totalStars = 5;
    return (
        <div className="flex">
            {[...Array(totalStars)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <span key={starValue}>
                        {starValue <= rating ? (
                            <RiStarSFill className="text-yellow-400" />
                        ) : (
                            <RiStarSLine className="text-gray-300" />
                        )}
                    </span>
                );
            })}
        </div>
    );
};


const RatingsView: React.FC = () => {
    // Estados para los datos
    const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
    const [sucursales, setSucursales] = useState<Sucursal[]>([]);
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    
    // Estados para los filtros
    const [filtros, setFiltros] = useState({
        sucursal: '',
        servicio: '',
        monitor: ''
    });

    // Estados de UI
    const [cargando, setCargando] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // useEffect para cargar todos los datos iniciales (calificaciones, sucursales, empleados)
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Usamos Promise.all para hacer todas las llamadas a la API en paralelo
                const [calificacionesRes, sucursalesRes, empleadosRes] = await Promise.all([
                    fetch('https://api.espaciopilatescl.cl/api/calificaciones'),
                    fetch('https://api.espaciopilatescl.cl/api/sucursales'),
                    fetch('https://api.espaciopilatescl.cl/api/empleados')
                ]);

                if (!calificacionesRes.ok || !sucursalesRes.ok || !empleadosRes.ok) {
                    throw new Error('Error al cargar los datos iniciales.');
                }

                const calificacionesData = await calificacionesRes.json();
                const sucursalesData = await sucursalesRes.json();
                const empleadosData = await empleadosRes.json();

                setCalificaciones(calificacionesData);
                setSucursales(sucursalesData);
                setEmpleados(empleadosData);

            } catch (err: any) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        };
        fetchData();
    }, []);
    
    // Lógica para filtrar las calificaciones (esto se podría hacer en el backend para mayor eficiencia)
    const calificacionesFiltradas = calificaciones.filter(cal => {
        const pasaFiltroSurcursal = !filtros.sucursal || cal.sucursal.nombre === filtros.sucursal;
        const pasaFiltroServicio = !filtros.servicio || cal.servicio.nombre === filtros.servicio;
        const pasaFiltroMonitor = !filtros.monitor || `${cal.empleado.nombre} ${cal.empleado.apellido_paterno}` === filtros.monitor;
        return pasaFiltroSurcursal && pasaFiltroServicio && pasaFiltroMonitor;
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFiltros(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    if (cargando) return <div className="p-8 text-center">Cargando calificaciones...</div>;
    if (error) return <div className="p-8"><div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"><p className="font-bold">Error</p><p>{error}</p></div></div>;

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Calificación de Servicios</h1>
            
            {/* Filtros */}
            <div className="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-wrap gap-4 items-center">
                <select name="sucursal" onChange={handleFilterChange} className="p-2 border rounded-md bg-gray-50">
                    <option value="">Todas las Sucursales</option>
                    {sucursales.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
                </select>
                <select name="servicio" onChange={handleFilterChange} className="p-2 border rounded-md bg-gray-50">
                    <option value="">Todos los Servicios</option>
                    {/* Estos podrían venir de la API en el futuro */}
                    <option>Pilates Reformer</option>
                    <option>Pilates Mat</option>
                </select>
                <select name="monitor" onChange={handleFilterChange} className="p-2 border rounded-md bg-gray-50">
                    <option value="">Todos los Monitores</option>
                    {empleados.map(e => <option key={e.id} value={`${e.nombre} ${e.apellido_paterno}`}>{e.nombre} {e.apellido_paterno}</option>)}
                </select>
            </div>

            {/* Tabla de Calificaciones */}
            <div className="bg-white rounded-xl shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th className="px-6 py-3">Calificación</th>
                            <th className="px-6 py-3">Sucursal</th>
                            <th className="px-6 py-3">Monitor</th>
                            <th className="px-6 py-3">Cliente</th>
                            <th className="px-6 py-3">Comentario</th>
                            <th className="px-6 py-3">Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {calificacionesFiltradas.map(cal => (
                            <tr key={cal.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4"><StarRating rating={cal.calificacion} /></td>
                                <td className="px-6 py-4">{cal.sucursal.nombre}</td>
                                <td className="px-6 py-4">{cal.empleado.nombre} {cal.empleado.apellido_paterno}</td>
                                <td className="px-6 py-4">{cal.cliente.nombre} {cal.cliente.apellido}</td>
                                <td className="px-6 py-4">{cal.comentario}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(cal.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RatingsView;
