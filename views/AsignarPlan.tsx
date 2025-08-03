import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RiFileList2Line, RiBankCardLine, RiCheckLine } from 'react-icons/ri';

// --- Definición de Tipos ---
interface Plan {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
}

interface MetodoPago {
    id: number;
    nombre: string;
}

const API_BASE_URL = 'https://api.espaciopilatescl.cl/api';

const AsignarPlan: React.FC = () => {
    const { id: clienteId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [planes, setPlanes] = useState<Plan[]>([]);
    const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
    const [planSeleccionado, setPlanSeleccionado] = useState<Plan | null>(null);
    const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<MetodoPago | null>(null);
    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]); // Fecha de hoy por defecto
    
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Efecto para cargar los planes y métodos de pago desde la API
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resPlanes, resMetodos] = await Promise.all([
                    fetch(`${API_BASE_URL}/planes`),
                    fetch(`${API_BASE_URL}/metodos-pago`)
                ]);
                if (!resPlanes.ok || !resMetodos.ok) throw new Error('No se pudieron cargar los datos iniciales.');
                
                const dataPlanes = await resPlanes.json();
                const dataMetodos = await resMetodos.json();

                setPlanes(dataPlanes);
                setMetodosPago(dataMetodos);
            } catch (err) {
                setError('Error al cargar datos. Por favor, intente de nuevo.');
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, []);

    const handleAsignarPlan = async () => {
        if (!planSeleccionado || !metodoPagoSeleccionado) {
            setError('Debe seleccionar un plan y un método de pago.');
            return;
        }
        setGuardando(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/cliente-plan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    cliente_id: clienteId,
                    plan_id: planSeleccionado.id,
                    fecha_inicio: fechaInicio,
                }),
            });
            if (!response.ok) throw new Error('No se pudo asignar el plan.');
            
            // Si todo sale bien, volvemos a la vista del cliente
            navigate(`/clientes/detalle/${clienteId}`);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) return <div className="p-8 text-center">Cargando...</div>;

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Asignar Plan a Cliente</h1>
            <div className="space-y-6">
                {/* Sección de Selección de Plan */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-3 mb-4"><RiFileList2Line className="text-purple-500" /> Selección de Plan/Servicio</h2>
                    {planSeleccionado ? (
                        <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-bold text-purple-800">{planSeleccionado.nombre}</p>
                                <p className="text-sm text-purple-600">{planSeleccionado.descripcion}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-purple-800">${new Intl.NumberFormat('es-CL').format(planSeleccionado.precio)}</p>
                                <button onClick={() => setPlanSeleccionado(null)} className="text-sm text-red-500 hover:underline">Cambiar selección</button>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-h-60">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-3 text-left font-semibold text-gray-600">Nombre</th>
                                        <th className="p-3 text-left font-semibold text-gray-600">Descripción</th>
                                        <th className="p-3 text-right font-semibold text-gray-600">Precio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {planes.map(plan => (
                                        <tr key={plan.id} onClick={() => setPlanSeleccionado(plan)} className="border-b hover:bg-purple-50 cursor-pointer">
                                            <td className="p-3 font-medium">{plan.nombre}</td>
                                            <td className="p-3 text-gray-600">{plan.descripcion}</td>
                                            <td className="p-3 text-right font-semibold">${new Intl.NumberFormat('es-CL').format(plan.precio)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Sección de Método de Pago */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-3 mb-4"><RiBankCardLine className="text-purple-500" /> Método de Pago</h2>
                    <div className="flex gap-4">
                        {metodosPago.map(metodo => (
                            <button key={metodo.id} onClick={() => setMetodoPagoSeleccionado(metodo)}
                                className={`py-2 px-4 rounded-lg border-2 transition-all ${metodoPagoSeleccionado?.id === metodo.id ? 'bg-purple-500 text-white border-purple-500' : 'bg-gray-100 hover:bg-gray-200 border-gray-200'}`}>
                                {metodo.nombre}
                            </button>
                        ))}
                    </div>
                </div>

                 {/* Sección de Fecha de Inicio */}
                 <div className="bg-white p-6 rounded-xl shadow-md">
                    <label htmlFor="fecha_inicio" className="block text-xl font-semibold text-gray-700 mb-2">Fecha de Inicio del Plan</label>
                    <input type="date" name="fecha_inicio" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)}
                        className="bg-gray-100 outline-none py-2 px-4 rounded-lg border-2 border-gray-200 focus:border-purple-500" />
                </div>

                {error && <div className="text-red-600 p-4 bg-red-50 rounded-lg"><strong>Error:</strong> {error}</div>}

                <div className="flex justify-end">
                    <button onClick={handleAsignarPlan} disabled={guardando || !planSeleccionado || !metodoPagoSeleccionado}
                        className="flex items-center justify-center gap-2 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300">
                        <RiCheckLine />
                        {guardando ? 'Asignando...' : 'Confirmar y Asignar Plan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AsignarPlan;
