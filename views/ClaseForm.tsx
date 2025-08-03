import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Definición de Tipos ---
interface Sucursal { id: number; nombre: string; }
interface Empleado { id: number; nombre: string; apellido_paterno: string; }
interface Servicio { id: number; nombre: string; }

const API_BASE_URL = 'https://api.espaciopilatescl.cl/api';

const ClaseForm: React.FC = () => {
  const navigate = useNavigate();

  // --- Estados de Datos ---
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  
  // --- Estados de UI ---
  const [loading, setLoading] = useState(true);
  const [errorOnLoad, setErrorOnLoad] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  
  // --- Estados del Formulario ---
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [sucursalId, setSucursalId] = useState('');
  const [servicioId, setServicioId] = useState('');
  const [monitorId, setMonitorId] = useState('');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('09:50');
  const [capacidad, setCapacidad] = useState(10);
  const [reemplazoIds, setReemplazoIds] = useState<string[]>([]);
  const [recurrencia, setRecurrencia] = useState('no_recurre');

  const diaSemana = useMemo(() => {
    const date = new Date(`${fecha}T12:00:00Z`); // Use midday UTC to avoid timezone shifts
    const dayIndex = date.getUTCDay();
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
    return dias[dayIndex];
  }, [fecha]);

  const duracion = useMemo(() => {
    if (!horaInicio || !horaFin) return 0;
    const [startH, startM] = horaInicio.split(':').map(Number);
    const [endH, endM] = horaFin.split(':').map(Number);
    const startDate = new Date(0, 0, 0, startH, startM, 0);
    const endDate = new Date(0, 0, 0, endH, endM, 0);
    const diff = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    return diff > 0 ? diff : 0;
  }, [horaInicio, horaFin]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorOnLoad(null);
      try {
        const responses = await Promise.allSettled([
          fetch(`${API_BASE_URL}/sucursales`),
          fetch(`${API_BASE_URL}/empleados`),
          fetch(`${API_BASE_URL}/servicios`)
        ]);

        const [sucursalesResult, empleadosResult, serviciosResult] = responses;
        let errors: string[] = [];

        if (sucursalesResult.status === 'fulfilled' && sucursalesResult.value.ok) {
            setSucursales(await sucursalesResult.value.json());
        } else { errors.push('sucursales'); }

        if (empleadosResult.status === 'fulfilled' && empleadosResult.value.ok) {
            setEmpleados(await empleadosResult.value.json());
        } else { errors.push('empleados'); }

        if (serviciosResult.status === 'fulfilled' && serviciosResult.value.ok) {
            setServicios(await serviciosResult.value.json());
        } else { errors.push('servicios'); }

        if (errors.length > 0) {
          throw new Error(`No se pudieron cargar los siguientes datos: ${errors.join(', ')}.`);
        }
      } catch (err) {
        setErrorOnLoad(err instanceof Error ? err.message : 'Ocurrió un error de red o de servidor.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);

    const nuevaClase = {
      fecha,
      sucursal_id: Number(sucursalId),
      servicio_id: Number(servicioId),
      empleado_id: Number(monitorId),
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      capacidad: Number(capacidad),
      reemplazo_ids: reemplazoIds.map(Number),
      recurrencia,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/clases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(nuevaClase),
      });

      if (!response.ok) {
        let errorMessage = `Error del servidor: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          console.error("La respuesta de error no era JSON.");
        }
        throw new Error(errorMessage);
      }
      
      const responseData = await response.json();
      setFormSuccess(responseData.message);
      setTimeout(() => navigate('/calendario'), 2000);

    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Ocurrió un error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderContent = () => {
    if (loading) {
      return <p className="text-center p-10">Cargando datos del formulario...</p>;
    }
    if (errorOnLoad) {
      return <div className="bg-red-100 text-red-800 p-4 rounded-md text-center">{errorOnLoad}</div>;
    }
    return (
        <form onSubmit={handleSubmit}>
            <div className="border rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-4">
                    <span className="text-red-500 text-2xl">🗓️</span>
                    <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="p-2 border-gray-300 rounded-md w-full" />
                    <span className="font-semibold text-red-500">{diaSemana}</span>
                </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4 p-4 border rounded-lg">
                    <div>
                        <label htmlFor="sucursal" className="block text-sm font-medium text-gray-700 mb-1">Sucursal</label>
                        <select id="sucursal" value={sucursalId} onChange={e => setSucursalId(e.target.value)} required className="w-full p-2 border-gray-300 rounded-md shadow-sm">
                            <option value="">Seleccione sucursal</option>
                            {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="servicio" className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
                        <select id="servicio" value={servicioId} onChange={e => setServicioId(e.target.value)} required className="w-full p-2 border-gray-300 rounded-md shadow-sm">
                            <option value="">Seleccione servicio</option>
                            {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="monitor" className="block text-sm font-medium text-gray-700 mb-1">Monitor</label>
                        <select id="monitor" value={monitorId} onChange={e => setMonitorId(e.target.value)} required className="w-full p-2 border-gray-300 rounded-md shadow-sm">
                            <option value="">Seleccione monitor</option>
                            {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre} {e.apellido_paterno}</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-4 p-4 border rounded-lg">
                    <div>
                        <label htmlFor="recurrencia" className="block text-sm font-medium text-gray-700 mb-1">Recurrencia</label>
                        <select id="recurrencia" value={recurrencia} onChange={e => setRecurrencia(e.target.value)} className="w-full p-2 border-gray-300 rounded-md shadow-sm">
                            <option value="no_recurre">No recurre</option>
                            <option value="1_mes">Repetir semanalmente por 1 mes</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="reemplazos" className="block text-sm font-medium text-gray-700 mb-1">Reemplazos (opcional)</label>
                        <select id="reemplazos" multiple value={reemplazoIds} onChange={e => setReemplazoIds(Array.from(e.target.selectedOptions, option => option.value))} className="w-full p-2 border-gray-300 rounded-md shadow-sm h-24">
                            {empleados.filter(e => e.id !== Number(monitorId)).map(e => <option key={e.id} value={e.id}>{e.nombre} {e.apellido_paterno}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                    <span className="text-green-500 text-4xl">🕒</span>
                    <div className="flex-grow">
                        <label htmlFor="hora_inicio" className="block text-xs font-medium text-gray-500">Inicio</label>
                        <input type="time" id="hora_inicio" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} required className="w-full p-2 border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="flex-grow">
                        <label htmlFor="hora_fin" className="block text-xs font-medium text-gray-500">Fin</label>
                        <input type="time" id="hora_fin" value={horaFin} onChange={e => setHoraFin(e.target.value)} required className="w-full p-2 border-gray-300 rounded-md shadow-sm" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                     <span className="text-blue-500 text-4xl">👥</span>
                     <div className="flex-grow">
                        <label htmlFor="capacidad" className="block text-xs font-medium text-gray-500">Cupos</label>
                        <input type="number" id="capacidad" value={capacidad} onChange={e => setCapacidad(parseInt(e.target.value, 10))} required min="1" className="w-full p-2 border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-gray-800">{duracion}</div>
                        <div className="text-sm text-gray-500">minutos</div>
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center">
                {formSuccess && <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">{formSuccess}</div>}
                {formError && <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">{formError}</div>}
                <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-300 disabled:bg-gray-400">
                    {isSubmitting ? 'Guardando...' : 'Guardar Clase'}
                </button>
            </div>
        </form>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Programar Nueva Clase</h1>
            <button type="button" onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 text-2xl">&rarr;</button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default ClaseForm;
