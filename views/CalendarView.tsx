import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, addDays, subDays, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// --- Icon Components (SVG) ---
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const InstructorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const AgendadosIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const DisponiblesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const EsperaIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CardAgendadosIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" /></svg>;
const CardEsperaIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;


// --- Paleta de Colores para Sucursales ---
const sucursalColors = [
  { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-800', tagBg: 'bg-purple-600' },
  { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800', tagBg: 'bg-blue-600' },
  { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800', tagBg: 'bg-green-600' },
  { bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-800', tagBg: 'bg-pink-600' },
  { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-800', tagBg: 'bg-indigo-600' },
];

const getSucursalColor = (sucursalId: number) => {
  return sucursalColors[sucursalId % sucursalColors.length];
};

// --- Definición de Tipos ---
interface Cliente { id: number; nombre: string; apellido: string; }
interface Sucursal { id: number; nombre: string; }
interface Servicio { id: number; nombre: string; }
interface Reserva { id: number; cliente: Cliente; }
interface ListaEspera { id: number; cliente: Cliente; }

interface ClaseBasica {
  id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  capacidad: number;
  cupos_disponibles: number;
  servicio: Servicio;
  monitor: { nombre: string; apellido_paterno: string; };
  sucursal: Sucursal;
  reservas_count: number;
  lista_espera_count: number;
}

interface ClaseDetallada extends ClaseBasica {
  reservas: Reserva[];
  lista_espera: ListaEspera[];
}

const API_BASE_URL = 'https://api.espaciopilatescl.cl/api';

const parseDateAsLocal = (dateString: string): Date => parseISO(dateString);

const CalendarView: React.FC = () => {
  // --- Estados de Datos ---
  const [todasLasClases, setTodasLasClases] = useState<ClaseBasica[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  
  // --- Estados de UI y Filtros ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filtroSucursal, setFiltroSucursal] = useState<string>('todos');
  const [filtroServicio, setFiltroServicio] = useState<string>('todos');
  
  // --- Estados del Modal ---
  const [claseSeleccionada, setClaseSeleccionada] = useState<ClaseDetallada | null>(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [clienteParaReservar, setClienteParaReservar] = useState<string>('');
  const [reservaStatus, setReservaStatus] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [clasesRes, sucursalesRes, serviciosRes, clientesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/clases`),
        fetch(`${API_BASE_URL}/sucursales`),
        fetch(`${API_BASE_URL}/servicios`),
        fetch(`${API_BASE_URL}/clientes`),
      ]);
      if (!clasesRes.ok || !sucursalesRes.ok || !serviciosRes.ok || !clientesRes.ok) {
          throw new Error('No se pudieron cargar todos los datos necesarios.');
      }
      const [clasesData, sucursalesData, serviciosData, clientesData] = await Promise.all([
          clasesRes.json(), sucursalesRes.json(), serviciosRes.json(), clientesRes.json()
      ]);
      setTodasLasClases(clasesData);
      setSucursales(sucursalesData);
      setServicios(serviciosData);
      setClientes(clientesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleClaseClick = async (claseId: number) => {
    setLoadingModal(true);
    setReservaStatus(null);
    setClienteParaReservar('');
    try {
      const response = await fetch(`${API_BASE_URL}/clases/${claseId}`);
      if (!response.ok) throw new Error('No se pudo cargar el detalle de la clase.');
      const data: ClaseDetallada = await response.json();
      setClaseSeleccionada(data);
    } catch (err) {
      setReservaStatus({ message: err instanceof Error ? err.message : 'Error desconocido', type: 'error' });
    } finally {
      setLoadingModal(false);
    }
  };

  const handleReservar = async () => {
    if (!clienteParaReservar || !claseSeleccionada) return;
    setReservaStatus(null);
    try {
        const response = await fetch(`${API_BASE_URL}/reservas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                clase_id: claseSeleccionada.id,
                cliente_id: parseInt(clienteParaReservar)
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error al procesar la reserva.');
        
        setReservaStatus({ message: data.message, type: 'success' });
        await handleClaseClick(claseSeleccionada.id);
        await fetchInitialData();
    } catch (err) {
        setReservaStatus({ message: err instanceof Error ? err.message : 'Error desconocido', type: 'error' });
    }
  };

  const handleCancelarReserva = async (reservaId: number) => {
    if (!claseSeleccionada) return;
    setReservaStatus(null);
    try {
        const response = await fetch(`${API_BASE_URL}/reservas/${reservaId}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error al cancelar la reserva.');
        
        setReservaStatus({ message: data.message, type: 'success' });
        await handleClaseClick(claseSeleccionada.id);
        await fetchInitialData();
    } catch (err) {
        setReservaStatus({ message: err instanceof Error ? err.message : 'Error desconocido', type: 'error' });
    }
  };

  const clasesFiltradas = todasLasClases.filter(clase => {
    const sucursalMatch = filtroSucursal === 'todos' || clase.sucursal.id === parseInt(filtroSucursal);
    const servicioMatch = filtroServicio === 'todos' || clase.servicio.id === parseInt(filtroServicio);
    return sucursalMatch && servicioMatch;
  });

  const clasesDeLaSemana = clasesFiltradas.filter(clase => 
    isWithinInterval(parseDateAsLocal(clase.fecha), { start: startOfWeek(currentDate, { weekStartsOn: 1 }), end: endOfWeek(currentDate, { weekStartsOn: 1 }) })
  );

  const clasesPorDia = (dia: Date): ClaseBasica[] => {
    const diaFormateado = format(dia, 'yyyy-MM-dd');
    return clasesDeLaSemana.filter(clase => clase.fecha === diaFormateado).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
  };

  const diasSemana = Array.from({ length: 7 }).map((_, i) => addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i));
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Calendario de Clases</h1>
        <div className="flex items-center gap-4 flex-wrap">
          <select value={filtroSucursal} onChange={e => setFiltroSucursal(e.target.value)} className="p-2 border rounded-md shadow-sm">
            <option value="todos">Todas las Sucursales</option>
            {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
          <select value={filtroServicio} onChange={e => setFiltroServicio(e.target.value)} className="p-2 border rounded-md shadow-sm">
            <option value="todos">Todos los Servicios</option>
            {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm">
            <button onClick={() => setCurrentDate(subDays(currentDate, 7))} className="p-2 rounded-md hover:bg-gray-200">&lt;</button>
            <span className="font-semibold text-lg text-gray-700">{format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM', { locale: es })} - {format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM, yyyy', { locale: es })}</span>
            <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="p-2 rounded-md hover:bg-gray-200">&gt;</button>
          </div>
          <Link to="/clases/nueva" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md">+ Programar Clase</Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {diasSemana.map(dia => (
          <div key={dia.toString()} className="bg-white rounded-lg shadow p-3 min-h-[300px]">
            <h3 className="font-bold text-center border-b pb-2 mb-3 capitalize">{format(dia, 'eeee', { locale: es })} <span className="font-normal text-gray-500">{format(dia, 'd')}</span></h3>
            <div className="space-y-2">
              {clasesPorDia(dia).map(clase => {
                const colors = getSucursalColor(clase.sucursal.id);
                return (
                  <div key={clase.id} onClick={() => handleClaseClick(clase.id)} className={`${colors.bg} border-l-4 ${colors.border} p-2 rounded-lg text-xs cursor-pointer hover:shadow-lg transition-shadow`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`font-bold ${colors.text}`}>{clase.servicio.nombre}</p>
                        <p className="text-gray-600">{clase.monitor.nombre}</p>
                        <p className="text-gray-500 italic text-[10px]">{clase.sucursal.nombre}</p>
                      </div>
                      <span className={`${colors.tagBg} text-white text-[10px] font-bold px-2 py-1 rounded-full`}>Pilates</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-gray-700">
                      <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-blue-600"><CardAgendadosIcon /> {clase.reservas_count}</span>
                          <span className="flex items-center gap-1 text-red-600"><CardEsperaIcon /> {clase.lista_espera_count}</span>
                      </div>
                      <span className="font-semibold">{clase.hora_inicio.substring(0, 5)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {claseSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={() => setClaseSeleccionada(null)}>
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            {loadingModal ? <p>Cargando detalles...</p> : (
            <>
              <div className="flex justify-between items-center pb-3 mb-4">
                <h2 className="text-xl font-bold text-gray-800">{claseSeleccionada.servicio.nombre}</h2>
                <span className={`${getSucursalColor(claseSeleccionada.sucursal.id).tagBg} text-white text-xs font-bold px-3 py-1 rounded-full`}>Pilates</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center"><ClockIcon /> {claseSeleccionada.hora_inicio.substring(0, 5)} - {claseSeleccionada.hora_fin.substring(0, 5)}</div>
                <div className="flex items-center"><InstructorIcon /> {claseSeleccionada.monitor.nombre}</div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center mb-4 border-t border-b py-4">
                <div>
                  <AgendadosIcon />
                  <p className="text-2xl font-bold">{claseSeleccionada.reservas.length}</p>
                  <p className="text-sm text-gray-600">Agendados</p>
                </div>
                <div>
                  <DisponiblesIcon />
                  <p className="text-2xl font-bold">{claseSeleccionada.cupos_disponibles}</p>
                  <p className="text-sm text-gray-600">Disponibles</p>
                </div>
                <div>
                  <EsperaIcon />
                  <p className="text-2xl font-bold">{claseSeleccionada.lista_espera.length}</p>
                  <p className="text-sm text-gray-600">En Espera</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold mb-2">Alumnos Agendados</h3>
                  <ul className="bg-gray-50 p-2 rounded h-32 overflow-y-auto text-sm border">
                    {claseSeleccionada.reservas.length > 0 ? claseSeleccionada.reservas.map(r => (
                      <li key={r.id} className="flex justify-between items-center p-1">
                        <span>{r.cliente.nombre} {r.cliente.apellido}</span>
                        <button onClick={() => handleCancelarReserva(r.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">CANCELAR</button>
                      </li>
                    )) : <li className="text-gray-500 p-1">No hay alumnos agendados.</li>}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Lista de Espera</h3>
                  <ul className="bg-gray-50 p-2 rounded h-32 overflow-y-auto text-sm border">
                    {claseSeleccionada.lista_espera.length > 0 ? claseSeleccionada.lista_espera.map(e => (
                      <li key={e.id} className="p-1">{e.cliente.nombre} {e.cliente.apellido}</li>
                    )) : <li className="text-gray-500 p-1">La lista de espera está vacía.</li>}
                  </ul>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <h3 className="font-bold mb-2">Inscribir Cliente</h3>
                <div className="flex gap-2">
                  <select value={clienteParaReservar} onChange={e => setClienteParaReservar(e.target.value)} className="flex-grow p-2 border rounded-md">
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
                  </select>
                  <button onClick={handleReservar} disabled={!clienteParaReservar} className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400">Reservar</button>
                </div>
                {reservaStatus && (
                  <p className={`mt-2 text-sm ${reservaStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {reservaStatus.message}
                  </p>
                )}
              </div>
            </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
