import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  subDays,
  isWithinInterval,
  differenceInMinutes,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { RiPencilLine, RiCloseCircleLine } from 'react-icons/ri';

/* ================= Icons ================= */
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const InstructorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const AgendadosIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const DisponiblesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const EsperaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const CardAgendadosIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />
  </svg>
);
const CardEsperaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

/* ================= Styling helpers ================= */
const sucursalColors = [
  { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-800', tagBg: 'bg-purple-600' },
  { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-800', tagBg: 'bg-blue-600' },
  { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800', tagBg: 'bg-green-600' },
  { bg: 'bg-pink-100', border: 'border-pink-500', text: 'text-pink-800', tagBg: 'bg-pink-600' },
  { bg: 'bg-indigo-100', border: 'border-indigo-500', text: 'text-indigo-800', tagBg: 'bg-indigo-600' },
];
const getSucursalColor = (sucursalId: number) => sucursalColors[sucursalId % sucursalColors.length];

/* ================= Types ================= */
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
  cupos_disponibles: number;
  estado: string;
  servicio: Servicio;
  monitor: { nombre: string; apellido_paterno: string };
  sucursal: Sucursal;
  reservas_count: number;
  lista_espera_count: number;
}
interface ClaseDetallada extends ClaseBasica {
  reservas: Reserva[];
  lista_espera: ListaEspera[];
}
interface PositionedClase extends ClaseBasica {
  top: number;
  height: number;
  left: number;
  width: number;
}
interface HoveredClaseInfo {
  clase: ClaseBasica;
  position: { top: number; left: number };
}
interface ReservasConfig {
  reserva_bloqueo_min?: number;
  cancel_bloqueo_min?: number;
}

/* ================= Const ================= */
const API_BASE_URL = 'https://api.espaciopilatescl.cl/api';

/* ====== Parsers robustos (evita “Trailing data”) ====== */
const parseDateAsLocal = (dateString: string): Date => {
  const raw = (dateString ?? '').trim();
  const onlyDate = raw.split(/[T\s]/)[0];
  const [y, m, d] = onlyDate.split('-').map(n => parseInt(n, 10));
  return new Date(y, (m || 1) - 1, d || 1);
};
const toDateTime = (fecha: string, hora: string): Date => {
  const f = (fecha ?? '').trim();
  const [y, m, d] = (f.split(/[T\s]/)[0] || '').split('-').map(n => parseInt(n, 10));
  const h = (hora ?? '').trim();
  const [hhStr = '0', mmStr = '0', ssRaw = '0'] = h.split(':');
  const ssStr = (ssRaw || '0').split(/[.,Z+\-]/)[0] || '0';
  const hh = parseInt(hhStr, 10) || 0;
  const mm = parseInt(mmStr, 10) || 0;
  const ss = parseInt(ssStr, 10) || 0;
  return new Date(y, (m || 1) - 1, d || 1, hh, mm, ss, 0);
};

/* ====== Layout helpers ====== */
const START_HOUR = 7;
const END_HOUR = 21;
const HOUR_HEIGHT_PX = 60;

const CalendarView: React.FC = () => {
  const navigate = useNavigate();

  // Data
  const [todasLasClases, setTodasLasClases] = useState<ClaseBasica[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros y UI
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filtroSucursal, setFiltroSucursal] = useState<string>('todos');
  const [filtroServicio, setFiltroServicio] = useState<string>('todos');

  // Modal
  const [claseSeleccionada, setClaseSeleccionada] = useState<ClaseDetallada | null>(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [clienteParaReservar, setClienteParaReservar] = useState<string>('');
  const [reservaStatus, setReservaStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [hoveredClase, setHoveredClase] = useState<HoveredClaseInfo | null>(null);

  // Política desde backend
  const [policy, setPolicy] = useState<{reservaMin: number; cancelMin: number}>({
    reservaMin: 60,
    cancelMin: 120,
  });

  // Carga inicial
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [clasesRes, sucursalesRes, serviciosRes, clientesRes, configRes] = await Promise.all([
        fetch(`${API_BASE_URL}/clases`),
        fetch(`${API_BASE_URL}/sucursales`),
        fetch(`${API_BASE_URL}/servicios`),
        fetch(`${API_BASE_URL}/clientes`),
        fetch(`${API_BASE_URL}/config-reservas`),
      ]);

      if (!clasesRes.ok || !sucursalesRes.ok || !serviciosRes.ok || !clientesRes.ok) {
        throw new Error('No se pudieron cargar todos los datos necesarios.');
      }

      const [clasesData, sucursalesData, serviciosData, clientesData] = await Promise.all([
        clasesRes.json(), sucursalesRes.json(), serviciosRes.json(), clientesRes.json(),
      ]);

      setTodasLasClases(clasesData);
      setSucursales(sucursalesData);
      setServicios(serviciosData);
      setClientes(clientesData);

      if (configRes.ok) {
        const cfg: ReservasConfig = await configRes.json();
        setPolicy({
          reservaMin: Number(cfg.reserva_bloqueo_min ?? 60),
          cancelMin: Number(cfg.cancel_bloqueo_min ?? 120),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  /* ========= Detalle de clase ========= */
  const handleClaseClick = async (claseId: number) => {
    setHoveredClase(null);
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

  /* ========= Reservar (o lista de espera si está llena) ========= */
  const handleReservar = async () => {
    if (!clienteParaReservar || !claseSeleccionada) return;
    setReservaStatus(null);
    try {
      const response = await fetch(`${API_BASE_URL}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ clase_id: claseSeleccionada.id, cliente_id: parseInt(clienteParaReservar) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al procesar la reserva.');
      setReservaStatus({ message: data.message, type: 'success' }); // 201 o 202
      await handleClaseClick(claseSeleccionada.id);
      await fetchInitialData();
    } catch (err) {
      setReservaStatus({ message: err instanceof Error ? err.message : 'No se pudo realizar la reserva.', type: 'error' });
    }
  };

  /* ========= Cancelar reserva puntual ========= */
  const handleCancelarReserva = async (reservaId: number) => {
    if (!claseSeleccionada) return;
    setReservaStatus(null);
    try {
      const response = await fetch(`${API_BASE_URL}/reservas/${reservaId}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
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

  /* ========= Cancelar clase completa (admin) ========= */
  const handleCancelarClase = async (claseId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta clase? Se devolverán las clases a todas las alumnas inscritas.')) return;
    setReservaStatus(null);
    try {
      const response = await fetch(`${API_BASE_URL}/clases/${claseId}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al cancelar la clase.');
      setReservaStatus({ message: data.message, type: 'success' });
      setClaseSeleccionada(null);
      await fetchInitialData();
    } catch (err) {
      setReservaStatus({ message: err instanceof Error ? err.message : 'Error desconocido', type: 'error' });
    }
  };

  /* ========= Semana / filtros ========= */
  const clasesDeLaSemana = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return todasLasClases.filter((clase) => {
      const sucursalMatch = filtroSucursal === 'todos' || clase.sucursal.id === parseInt(filtroSucursal);
      const servicioMatch = filtroServicio === 'todos' || clase.servicio.id === parseInt(filtroServicio);
      return sucursalMatch && servicioMatch && isWithinInterval(parseDateAsLocal(clase.fecha), { start, end });
    });
  }, [todasLasClases, currentDate, filtroSucursal, filtroServicio]);

  const diasSemana = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i)),
    [currentDate]
  );

  const positionedClasesPorDia = useMemo(() => {
    const timeToMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    const dailyClases: { [key: string]: PositionedClase[] } = {};
    for (const dia of diasSemana) {
      const diaFormateado = format(dia, 'yyyy-MM-dd');
      const clasesDelDia = clasesDeLaSemana
        .filter((c) => c.fecha === diaFormateado)
        .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
      if (clasesDelDia.length === 0) {
        dailyClases[diaFormateado] = [];
        continue;
      }
      const positionedClases: PositionedClase[] = [];
      const columns: ClaseBasica[][] = [];
      for (const clase of clasesDelDia) {
        const startMinutes = timeToMinutes(clase.hora_inicio);
        let placed = false;
        for (const col of columns) {
          const lastEventInCol = col[col.length - 1];
          if (timeToMinutes(lastEventInCol.hora_fin) <= startMinutes) {
            col.push(clase);
            placed = true;
            break;
          }
        }
        if (!placed) columns.push([clase]);
      }
      for (let i = 0; i < columns.length; i++) {
        for (const clase of columns[i]) {
          const startMinutes = timeToMinutes(clase.hora_inicio);
          const endMinutes = timeToMinutes(clase.hora_fin);
          positionedClases.push({
            ...clase,
            top: ((startMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT_PX,
            height: ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT_PX,
            left: (i / columns.length) * 100,
            width: 100 / columns.length,
          });
        }
      }
      dailyClases[diaFormateado] = positionedClases;
    }
    return dailyClases;
  }, [clasesDeLaSemana, diasSemana]);

  /* ========= Hover popover ========= */
  const handleMouseEnter = (clase: ClaseBasica, e: React.MouseEvent) => {
    setHoveredClase({ clase, position: { top: e.clientY + 15, left: e.clientX + 15 } });
  };
  const handleMouseLeave = () => setHoveredClase(null);

  /* ========= Ventanas de tiempo (UI) ========= */
  const fueraDeHorarioReserva = (c: ClaseDetallada | null) => {
    if (!c) return false;
    const start = toDateTime(c.fecha, c.hora_inicio);
    return differenceInMinutes(start, new Date()) < policy.reservaMin;
  };
  const fueraDeHorarioCancelacion = (c: ClaseDetallada | null) => {
    if (!c) return false;
    const start = toDateTime(c.fecha, c.hora_inicio);
    return differenceInMinutes(start, new Date()) < policy.cancelMin;
  };

  const reservaBloqueada = fueraDeHorarioReserva(claseSeleccionada);
  const cancelacionBloqueada = fueraDeHorarioCancelacion(claseSeleccionada);

  /* ========= Helpers de mensajes (ajustado para lista de espera) ========= */
  const esClaseLlena = (claseSeleccionada?.cupos_disponibles ?? 0) <= 0;
  const razonesReserva: string[] = [];
  if (!clienteParaReservar) razonesReserva.push('Selecciona una alumna');
  if (reservaBloqueada) razonesReserva.push(`Menos de ${policy.reservaMin} min de anticipación`);
  const textoBotonReservar = esClaseLlena ? 'Lista de espera' : 'Reservar';

  /* ================= Render ================= */
  return (
    <div className="p-4 md:p-8">
      {/* Encabezado + filtros */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Calendario de Clases</h1>
        <div className="flex items-center gap-4 flex-wrap">
          <select value={filtroSucursal} onChange={(e) => setFiltroSucursal(e.target.value)} className="p-2 border rounded-md shadow-sm bg-white">
            <option value="todos">Todas las Sucursales</option>
            {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
          <select value={filtroServicio} onChange={(e) => setFiltroServicio(e.target.value)} className="p-2 border rounded-md shadow-sm bg-white">
            <option value="todos">Todos los Servicios</option>
            {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm">
            <button onClick={() => setCurrentDate(subDays(currentDate, 7))} className="p-2 rounded-md hover:bg-gray-200">&lt;</button>
            <span className="font-semibold text-lg text-gray-700">
              {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM', { locale: es })} - {format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM, yyyy', { locale: es })}
            </span>
            <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="p-2 rounded-md hover:bg-gray-200">&gt;</button>
          </div>
          <Link to="/clases/nueva" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md">+ Programar Clase</Link>
        </div>
      </div>

      {/* Grid principal */}
      {loading ? (
        <div className="text-center p-8">Cargando calendario...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-[auto_1fr] md:grid-cols-[60px_repeat(7,1fr)]">
            <div className="sticky top-0 bg-white z-10"></div>
            {Array.from({ length: 7 }).map((_, i) => {
              const dia = addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i);
              return (
                <div key={dia.toString()} className="text-center font-bold border-b border-r p-2 sticky top-0 bg-white z-10">
                  <span className="text-gray-500 text-xs uppercase">{format(dia, 'eee', { locale: es })}</span>
                  <span className="block text-xl">{format(dia, 'd')}</span>
                </div>
              );
            })}

            {/* Eje horario */}
            <div className="row-start-2 col-start-1 text-xs text-right pr-2">
              {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => (
                <div key={i} className="h-[60px] relative -top-2">
                  <span className="text-gray-500">{format(new Date(0, 0, 0, START_HOUR + i), 'HH:mm')}</span>
                </div>
              ))}
            </div>

            {/* Celdas y clases */}
            <div className="row-start-2 col-start-2 grid grid-cols-1 md:grid-cols-7 col-span-1 md:col-span-7 relative">
              {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => (
                <div key={i} className="col-span-7 h-[60px] border-t border-gray-200"></div>
              ))}

              {Array.from({ length: 7 }).map((_, i) => {
                const dia = addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i);
                const diaFormateado = format(dia, 'yyyy-MM-dd');
                return (
                  <div
                    key={dia.toString()}
                    className="absolute top-0 h-full border-r w-[calc(100%/7)]"
                    style={{ left: `${i * (100 / 7)}%` }}
                  >
                    {positionedClasesPorDia[diaFormateado]?.map((clase) => {
                      const colors = getSucursalColor(clase.sucursal.id);
                      const isCancelada = clase.estado === 'cancelada';
                      return (
                        <div
                          key={clase.id}
                          onClick={() => !isCancelada && handleClaseClick(clase.id)}
                          onMouseEnter={(e) => !isCancelada && handleMouseEnter(clase, e)}
                          onMouseLeave={handleMouseLeave}
                          className={`absolute p-2 rounded-lg transition-shadow overflow-hidden flex flex-col ${
                            isCancelada ? 'bg-red-50 border-red-200 opacity-60' : `${colors.bg} border ${colors.border} cursor-pointer hover:shadow-lg`
                          }`}
                          style={{ top: `${clase.top}px`, height: `${clase.height}px`, left: `${clase.left}%`, width: `${clase.width}%` }}
                        >
                          <p className={`font-bold text-sm leading-tight ${isCancelada ? 'text-red-700 line-through' : colors.text}`}>{clase.servicio.nombre}</p>
                          <p className={`text-xs truncate ${isCancelada ? 'text-gray-500 line-through' : 'text-gray-600'}`}>{clase.monitor.nombre}</p>
                          <div className="flex-grow" />
                          <div className="flex items-center justify-between text-xs mt-auto pt-1">
                            <span className={`flex items-center gap-1 ${isCancelada ? 'text-gray-400' : 'text-blue-600'}`}><CardAgendadosIcon /> <span className="font-semibold">{clase.reservas_count}</span></span>
                            <span className={`flex items-center gap-1 ${isCancelada ? 'text-gray-400' : 'text-red-600'}`}><CardEsperaIcon /> <span className="font-semibold">{clase.lista_espera_count}</span></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Popover */}
      {hoveredClase && (
        <div className="fixed bg-white rounded-lg shadow-xl p-4 z-50 w-64 border" style={{ top: hoveredClase.position.top, left: hoveredClase.position.left }}>
          <div className="flex justify-between items-center pb-2 mb-2 border-b">
            <h3 className="font-bold text-lg">{hoveredClase.clase.servicio.nombre}</h3>
            <span className={`${getSucursalColor(hoveredClase.clase.sucursal.id).tagBg} text-white text-xs font-bold px-3 py-1 rounded-full`}>Pilates</span>
          </div>
          <div className="text-sm space-y-2">
            <div className="flex items-center"><ClockIcon /> {hoveredClase.clase.hora_inicio.substring(0, 5)} - {hoveredClase.clase.hora_fin.substring(0, 5)}</div>
            <div className="flex items-center"><InstructorIcon /> {hoveredClase.clase.monitor.nombre}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center mt-3 pt-3 border-t">
            <div><p className="text-xl font-bold text-blue-600">{hoveredClase.clase.reservas_count}</p><p className="text-xs text-gray-600">Agendados</p></div>
            <div><p className="text-xl font-bold text-green-600">{hoveredClase.clase.cupos_disponibles}</p><p className="text-xs text-gray-600">Disponibles</p></div>
            <div><p className="text-xl font-bold text-red-600">{hoveredClase.clase.lista_espera_count}</p><p className="text-xs text-gray-600">En Espera</p></div>
          </div>
        </div>
      )}

      {/* Modal */}
      {claseSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={() => setClaseSeleccionada(null)}>
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            {loadingModal ? (
              <p>Cargando detalles...</p>
            ) : (
              <>
                <div className="flex justify-between items-center pb-3 mb-2">
                  <h2 className="text-xl font-bold text-gray-800">{claseSeleccionada.servicio.nombre}</h2>
                  <span className={`${getSucursalColor(claseSeleccionada.sucursal.id).tagBg} text-white text-xs font-bold px-3 py-1 rounded-full`}>Pilates</span>
                </div>

                {/* Política visible */}
                <p className="text-xs text-gray-500 mb-3">
                  Política: Reservar ≥ <strong>{policy.reservaMin}</strong> min · Cancelar ≥ <strong>{policy.cancelMin}</strong> min
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center"><ClockIcon /> {claseSeleccionada.hora_inicio.substring(0, 5)} - {claseSeleccionada.hora_fin.substring(0, 5)}</div>
                  <div className="flex items-center"><InstructorIcon /> {claseSeleccionada.monitor.nombre}</div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center mb-4 border-t border-b py-4">
                  <div><AgendadosIcon /><p className="text-2xl font-bold">{claseSeleccionada.reservas.length}</p><p className="text-sm text-gray-600">Agendados</p></div>
                  <div><DisponiblesIcon /><p className="text-2xl font-bold">{claseSeleccionada.cupos_disponibles}</p><p className="text-sm text-gray-600">Disponibles</p></div>
                  <div><EsperaIcon /><p className="text-2xl font-bold">{claseSeleccionada.lista_espera.length}</p><p className="text-sm text-gray-600">En Espera</p></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-bold mb-2">Alumnas Agendadas</h3>
                    <ul className="bg-gray-50 p-2 rounded h-32 overflow-y-auto text-sm border">
                      {claseSeleccionada.reservas.length > 0 ? (
                        claseSeleccionada.reservas.map((r) => (
                          <li key={r.id} className="flex justify-between items-center p-1">
                            <span>{r.cliente.nombre} {r.cliente.apellido}</span>
                            <button
                              onClick={() => handleCancelarReserva(r.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-semibold disabled:text-gray-400"
                              disabled={cancelacionBloqueada}
                              title={cancelacionBloqueada ? `No se puede cancelar con menos de ${policy.cancelMin} minutos` : 'Cancelar reserva'}
                            >
                              CANCELAR
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 p-1">No hay alumnas agendadas.</li>
                      )}
                    </ul>
                    {cancelacionBloqueada && (
                      <p className="text-xs text-gray-500 mt-2">
                        Las cancelaciones están bloqueadas a menos de {policy.cancelMin} minutos del inicio.
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">Lista de Espera</h3>
                    <ul className="bg-gray-50 p-2 rounded h-32 overflow-y-auto text-sm border">
                      {claseSeleccionada.lista_espera.length > 0 ? (
                        claseSeleccionada.lista_espera.map((e) => (
                          <li key={e.id} className="p-1">{e.cliente.nombre} {e.cliente.apellido}</li>
                        ))
                      ) : (
                        <li className="text-gray-500 p-1">La lista de espera está vacía.</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <h3 className="font-bold mb-2">Inscribir Alumna</h3>
                  <div className="flex gap-2">
                    <select
                      value={clienteParaReservar}
                      onChange={(e) => setClienteParaReservar(e.target.value)}
                      className="flex-grow p-2 border rounded-md"
                    >
                      <option value="">Seleccionar alumna...</option>
                      {clientes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre} {c.apellido}
                        </option>
                      ))}
                    </select>

                    {/* Habilitado aun cuando no hay cupos: se une a lista de espera */}
                    <button
                      onClick={handleReservar}
                      disabled={!clienteParaReservar || reservaBloqueada}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
                      title={
                        !clienteParaReservar
                          ? 'Selecciona una alumna'
                          : reservaBloqueada
                          ? `No se puede reservar con menos de ${policy.reservaMin} minutos`
                          : esClaseLlena
                          ? 'Clase llena: se inscribirá en lista de espera'
                          : 'Reservar'
                      }
                    >
                      {textoBotonReservar}
                    </button>
                  </div>

                  {/* Info clara cuando la clase está llena */}
                  {esClaseLlena && !reservaBloqueada && clienteParaReservar && (
                    <p className="text-xs text-gray-600 mt-2">
                      Clase llena: al confirmar, la alumna quedará en <span className="font-semibold">lista de espera</span>.
                    </p>
                  )}

                  {/* Mensajes de bloqueo reales (sin “no hay cupos”) */}
                  {(!clienteParaReservar || reservaBloqueada) && (
                    <p className="text-xs text-red-600 mt-2">
                      No se puede reservar: {razonesReserva.join(' · ')}.
                    </p>
                  )}
                </div>

                <div className="mt-6 border-t pt-4 flex justify-end gap-3">
                  <button
                    onClick={() => navigate(`/clases/editar/${claseSeleccionada.id}`)}
                    className="flex items-center gap-2 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <RiPencilLine /> Editar Clase
                  </button>
                  <button
                    onClick={() => handleCancelarClase(claseSeleccionada.id)}
                    className="flex items-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <RiCloseCircleLine /> Cancelar Clase
                  </button>
                </div>

                {reservaStatus && (
                  <p className={`mt-4 text-center text-sm ${reservaStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {reservaStatus.message}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
