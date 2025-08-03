import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { RiAddLine, RiPencilLine } from 'react-icons/ri';

// --- Definición de Tipos ---
interface Cliente {
    id: number;
    nombre: string;
    apellido: string;
    rut: string;
    genero: string;
    telefono: string;
    usuario: { email: string };
}
interface PlanAsignado {
    id: number;
    fecha_inicio: string;
    fecha_fin: string;
    clases_restantes: number;
    estado: string;
    plan: { // Objeto anidado con los detalles del plan del catálogo
        nombre: string;
        precio: number;
        cantidad_clases: number;
    };
}

const API_BASE_URL = 'https://api.espaciopilatescl.cl/api';

const ClienteDetalle: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Obtiene el ID del cliente de la URL

    const [cliente, setCliente] = useState<Cliente | null>(null);
    const [planes, setPlanes] = useState<PlanAsignado[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const cargarDatosCliente = async () => {
            setCargando(true);
            try {
                // Hacemos dos llamadas a la API en paralelo para más eficiencia
                const [resCliente, resPlanes] = await Promise.all([
                    fetch(`${API_BASE_URL}/clientes/${id}`),
                    fetch(`${API_BASE_URL}/clientes/${id}/planes`) // El nuevo endpoint que creamos
                ]);
                if (!resCliente.ok || !resPlanes.ok) throw new Error('No se pudieron cargar los datos del cliente.');
                
                const dataCliente = await resCliente.json();
                const dataPlanes = await resPlanes.json();

                setCliente(dataCliente);
                setPlanes(dataPlanes);
            } catch (err) {
                setError('Error al cargar datos. Por favor, intente de nuevo.');
            } finally {
                setCargando(false);
            }
        };
        cargarDatosCliente();
    }, [id]);

    if (cargando) return <div className="p-8 text-center">Cargando...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!cliente) return <div className="p-8 text-center">Cliente no encontrado.</div>;

    const planesActivos = planes.filter(p => p.estado === 'activo').length;

    return (
        <div className="p-4 md:p-8">
            {/* Cabecera del Perfil */}
            <div className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                    <div className="w-24 h-24 bg-purple-200 rounded-full flex items-center justify-center text-purple-600 text-4xl font-bold">
                        {cliente.nombre.charAt(0)}{cliente.apellido.charAt(0)}
                    </div>
                    {/* --- BOTÓN CLAVE PARA AÑADIR PLAN --- */}
                    <Link to={`/clientes/${cliente.id}/asignar-plan`}
                        className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2 hover:bg-green-600 transition-transform duration-200 hover:scale-110"
                        title="Asignar nuevo plan">
                        <RiAddLine size={20} />
                    </Link>
                </div>
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-800">{cliente.nombre} {cliente.apellido}</h1>
                    <p className="text-gray-500">{planesActivos} Planes Activos</p>
                </div>
                <div className="md:ml-auto border rounded-lg p-4 text-sm bg-gray-50 self-stretch">
                    <h3 className="font-bold mb-2 text-gray-700">Datos del usuario</h3>
                    <p><strong>RUT:</strong> {cliente.rut}</p>
                    <p><strong>Email:</strong> {cliente.usuario.email}</p>
                    <p><strong>Teléfono:</strong> {cliente.telefono}</p>
                </div>
            </div>

            {/* Pestañas y contenido */}
            <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Planes Comprados</h3>
                <div className="space-y-4">
                    {planes.length > 0 ? planes.map(plan => (
                        <div key={plan.id} className="bg-white p-4 rounded-xl shadow-md">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-800">{plan.plan.nombre}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-600">{plan.estado}</span>
                                    <button className="text-orange-500"><RiPencilLine /></button>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 mt-2 space-y-1">
                                <p><strong>Precio:</strong> ${new Intl.NumberFormat('es-CL').format(plan.plan.precio)}</p>
                                <p><strong>Fechas:</strong> Inicio: {plan.fecha_inicio} | Término: {plan.fecha_fin}</p>
                                <div>
                                    <p className="mb-1"><strong>Consumo:</strong></p>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${((plan.plan.cantidad_clases - plan.clases_restantes) / plan.plan.cantidad_clases) * 100}%` }}></div>
                                    </div>
                                    <p className="text-xs text-right mt-1">{plan.plan.cantidad_clases - plan.clases_restantes} / {plan.plan.cantidad_clases}</p>
                                 </div>
                            </div>
                        </div>
                    )) : <p className="text-gray-500 italic">Este cliente no tiene planes asignados.</p>}
                </div>
            </div>
        </div>
    );
};

export default ClienteDetalle;