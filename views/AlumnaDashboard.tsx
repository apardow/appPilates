import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';

import {
  getPlanes,
  getActividades,
  getPagos,
  getDocumentos,
  getResumen,
  uploadClienteDocumento,
  deleteClienteDocumento,
} from '../data/alumnaApi';

import type {
  PlanAlumna,
  ActividadAlumna,
  PagoAlumna,
  DocumentoAlumna,
  AlumnaResumen,
} from '../types/alumna';

import { fmtMoneda, fmtDia, fmtHora, initials } from '../utils/format';
import { toCsv, downloadCsv } from '../utils/csv';
import {
  Badge,
  BadgePlan,
  BadgeActividad,
} from '../components/common/StatusBadges';

/* ================= Config ================= */
const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE ??
  'https://api.espaciopilatescl.cl/api';

type Props = { clienteId?: number };
type TabKey = 'planes' | 'actividades' | 'pagos' | 'documentos';

type Cliente = {
  id: number;
  nombre: string;
  apellido: string;
  genero?: string | null;
  rut?: string | null;
  telefono?: string | null;
  usuario?: { email?: string | null };
};

/* ================= Componente ================= */
export default function AlumnaDashboard({ clienteId: propId }: Props) {
  const params = useParams<{ id?: string; clienteId?: string }>();
  const parsedFromUrl = useMemo(() => {
    const raw = params.id ?? params.clienteId;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [params.id, params.clienteId]);

  const clienteId = useMemo(
    () => propId ?? parsedFromUrl,
    [propId, parsedFromUrl],
  );
  const [tab, setTab] = useState<TabKey>('planes');

  // Perfil
  const [alumna, setAlumna] = useState<Cliente | null>(null);
  const [loadingPerfil, setLoadingPerfil] = useState(false);

  // Resumen (badge)
  const [resumen, setResumen] = useState<AlumnaResumen | null>(null);

  // Planes
  const [planes, setPlanes] = useState<PlanAlumna[] | null>(null);
  const [loadingPlanes, setLoadingPlanes] = useState(false);
  const [errPlanes, setErrPlanes] = useState<string | null>(null);
  const [planEstado, setPlanEstado] = useState<'todos' | PlanAlumna['estado']>(
    'todos',
  );
  const [planLimit, setPlanLimit] = useState<number>(20);

  // Actividades
  const [actividades, setActividades] = useState<ActividadAlumna[] | null>(
    null,
  );
  const [loadingAct, setLoadingAct] = useState(false);
  const [errAct, setErrAct] = useState<string | null>(null);
  const [desde, setDesde] = useState<string>('');
  const [hasta, setHasta] = useState<string>('');
  const [actEstado, setActEstado] = useState<
    'todos' | ActividadAlumna['estado']
  >('todos');
  const [actLimit, setActLimit] = useState<number>(50);

  // Pagos
  const [pagos, setPagos] = useState<PagoAlumna[] | null>(null);
  const [loadingPagos, setLoadingPagos] = useState(false);
  const [errPagos, setErrPagos] = useState<string | null>(null);
  const [pagoEstado, setPagoEstado] = useState<'todos' | PagoAlumna['estado']>(
    'todos',
  );
  const [pagoMetodo, setPagoMetodo] = useState<string>('');
  const [pagoLimit, setPagoLimit] = useState<number>(20);

  // Documentos (lista)
  const [docs, setDocs] = useState<DocumentoAlumna[] | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [errDocs, setErrDocs] = useState<string | null>(null);
  // Documentos – filtros (SEPARADOS del form)
  const [docTipoFilter, setDocTipoFilter] = useState<string>('');
  const [docLimit, setDocLimit] = useState<number>(20);
  // Documentos – formulario de subida (SEPARADO del filtro)
  const [docNombre, setDocNombre] = useState('');
  const [docTipoForm, setDocTipoForm] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);

  // Perfil
  useEffect(() => {
    if (!clienteId) return;
    (async () => {
      try {
        setLoadingPerfil(true);
        const res = await fetch(`${API_BASE}/clientes/${clienteId}`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data: Cliente = await res.json();
        setAlumna(data);
      } catch {
        setAlumna(null);
      } finally {
        setLoadingPerfil(false);
      }
    })();
  }, [clienteId]);

  // Resumen (badge)
  useEffect(() => {
    if (!clienteId) return;
    (async () => {
      try {
        const data = await getResumen(clienteId);
        setResumen(data);
      } catch {
        setResumen(null);
      }
    })();
  }, [clienteId]);

  // Carga por pestaña (on demand)
  useEffect(() => {
    if (!clienteId) return;
    (async () => {
      try {
        if (tab === 'planes' && planes === null && !loadingPlanes) {
          setLoadingPlanes(true);
          setErrPlanes(null);
          const data = await getPlanes(clienteId);
          setPlanes(data);
        }
        if (tab === 'actividades' && actividades === null && !loadingAct) {
          setLoadingAct(true);
          setErrAct(null);
          const data = await getActividades(clienteId);
          setActividades(data);
        }
        if (tab === 'pagos' && pagos === null && !loadingPagos) {
          setLoadingPagos(true);
          setErrPagos(null);
          const data = await getPagos(clienteId);
          setPagos(data);
        }
        if (tab === 'documentos' && docs === null && !loadingDocs) {
          setLoadingDocs(true);
          setErrDocs(null);
          const data = await getDocumentos(clienteId);
          setDocs(data);
        }
      } catch (e: any) {
        const msg = e?.message ?? 'Error desconocido';
        if (tab === 'planes') setErrPlanes(msg);
        if (tab === 'actividades') setErrAct(msg);
        if (tab === 'pagos') setErrPagos(msg);
        if (tab === 'documentos') setErrDocs(msg);
      } finally {
        if (tab === 'planes') setLoadingPlanes(false);
        if (tab === 'actividades') setLoadingAct(false);
        if (tab === 'pagos') setLoadingPagos(false);
        if (tab === 'documentos') setLoadingDocs(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, clienteId]);

  if (!clienteId) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-xl font-semibold mb-3">Dashboard de Alumna</h1>
        <p className="text-sm">
          Falta <code>clienteId</code>. Usa{' '}
          <code>{`<AlumnaDashboard clienteId={123} />`}</code> o la ruta
          <code className="ml-1">/alumna/:id</code>.
        </p>
      </div>
    );
  }

  // Badge: usa el resumen; si no, calcula desde planes (si ya se cargaron)
  const planesActivosBadge =
    resumen?.activos ??
    (planes ?? []).filter(
      (p) => p.estado === 'vigente' && (Number(p.clases_restantes) ?? 0) > 0,
    ).length;

  const TabButton = ({ id, label }: { id: TabKey; label: string }) => (
    <button
      onClick={() => setTab(id)}
      className={`px-4 py-2 -mb-px border-b-2 ${
        tab === id
          ? 'border-purple-600 text-purple-700 font-medium'
          : 'border-transparent text-gray-600'
      }`}
      aria-current={tab === id ? 'page' : undefined}
    >
      {label}
    </button>
  );

  const Section = ({ children }: { children: any }) => (
    <div className="space-y-4">{children}</div>
  );

  // PUT estado plan
  async function updatePlanEstado(
    planId: number,
    nuevoEstado: PlanAlumna['estado'],
  ) {
    const res = await fetch(`${API_BASE}/cliente-plan/${planId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(msg || `Error ${res.status}`);
    }
    try {
      const data = await getResumen(clienteId);
      setResumen(data);
    } catch {
      /* no-op */
    }
    return true;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {/* Avatar + badge + acción */}
        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-2xl font-bold">
            {initials(alumna?.nombre, alumna?.apellido)}
          </div>

          <div className="flex-1">
            <div className="text-lg font-semibold">
              {alumna
                ? `${alumna.nombre} ${alumna.apellido}`
                : loadingPerfil
                  ? 'Cargando…'
                  : '—'}
            </div>
            <div className="text-xs text-gray-500">Cliente #{clienteId}</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-16 h-16 border rounded-lg flex flex-col items-center justify-center">
              <div className="text-xl font-bold">{planesActivosBadge}</div>
              <div className="text-[10px] text-gray-500 leading-none text-center">
                Planes Activos
              </div>
            </div>
            <Link
              to={`/clientes/${clienteId}/asignar-plan`}
              className="h-9 px-3 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center justify-center"
              title="Asignar nuevo plan"
            >
              +
            </Link>
          </div>
        </div>

        {/* Datos del usuario */}
        <div className="md:col-span-2 bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Datos del usuario</div>
            <button className="px-3 py-1 text-xs rounded border hover:bg-gray-50">
              Editar
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Nombre:</span>{' '}
              <span className="font-medium">{alumna?.nombre ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-500">Apellido:</span>{' '}
              <span className="font-medium">{alumna?.apellido ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-500">Género:</span>{' '}
              <span className="font-medium">{alumna?.genero ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-500">RUT:</span>{' '}
              <span className="font-medium">{alumna?.rut ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-500">Teléfono:</span>{' '}
              <span className="font-medium">{alumna?.telefono ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-500">Email:</span>{' '}
              <span className="font-medium">
                {alumna?.usuario?.email ?? '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <nav
        className="flex gap-6 border-b mt-6 mb-4"
        aria-label="Secciones Alumna"
      >
        <TabButton id="planes" label="Planes comprados" />
        <TabButton id="actividades" label="Actividades" />
        <TabButton id="pagos" label="Pagos" />
        <TabButton id="documentos" label="Documentos médicos" />
      </nav>

      {/* PLANES */}
      {tab === 'planes' && (
        <Section>
          {/* Filtros */}
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm">
              Estado
              <select
                className="block border rounded px-2 py-1 mt-1"
                value={planEstado}
                onChange={(e) => setPlanEstado(e.target.value as any)}
              >
                <option value="todos">Todos</option>
                <option value="vigente">Vigente</option>
                <option value="consumido">Consumido</option>
                <option value="caducado">Caducado</option>
                <option value="eliminado">Eliminado</option>
              </select>
            </label>
            <label className="text-sm">
              Límite
              <input
                type="number"
                min={1}
                className="block border rounded px-2 py-1 mt-1 w-24"
                value={planLimit}
                onChange={(e) => setPlanLimit(Number(e.target.value || 0))}
              />
            </label>
            <button
              className="px-3 py-2 border rounded"
              onClick={async () => {
                try {
                  setLoadingPlanes(true);
                  setErrPlanes(null);
                  const data = await getPlanes(clienteId, {
                    estado: planEstado === 'todos' ? undefined : planEstado,
                    limit: planLimit || undefined,
                  });
                  setPlanes(data);
                  try {
                    const r = await getResumen(clienteId);
                    setResumen(r);
                  } catch {} // no-op
                } catch (e: any) {
                  setErrPlanes(e?.message ?? 'Error desconocido');
                } finally {
                  setLoadingPlanes(false);
                }
              }}
            >
              Aplicar
            </button>
          </div>

          {/* Lista */}
          {loadingPlanes && <div>Cargando planes…</div>}
          {errPlanes && <div className="text-red-600">Error: {errPlanes}</div>}
          {planes?.length === 0 && <div>Sin planes contratados.</div>}
          {planes?.map((p) => {
            const total = Number(p.cantidad_clases) || 0;
            const usadas =
              Number(p.clases_consumidas) ||
              total - Number(p.clases_restantes || 0);
            const pct =
              total > 0
                ? Math.min(100, Math.max(0, (usadas / total) * 100))
                : 0;

            return (
              <div
                key={p.cliente_plan_id}
                className="bg-white rounded-xl shadow px-4 py-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-semibold">{p.plan_nombre}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="mr-4">
                        Inicio:{' '}
                        <span className="font-medium">
                          {p.fecha_inicio ? fmtDia(p.fecha_inicio) : '—'}
                        </span>
                      </span>
                      <span>
                        Término:{' '}
                        <span className="font-medium">
                          {p.fecha_fin ? fmtDia(p.fecha_fin) : '—'}
                        </span>
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-xs text-right text-gray-600 mt-1">
                        {usadas} / {total}
                      </div>
                    </div>
                  </div>

                  {/* Cambio de estado inline */}
                  <div className="pt-1 flex flex-col items-end gap-2">
                    <div className="hidden sm:block">
                      <BadgePlan estado={p.estado} />
                    </div>
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={p.estado}
                      onChange={async (e) => {
                        const nuevo = e.target.value as PlanAlumna['estado'];
                        const snapshot = planes ?? [];
                        setPlanes((prev) =>
                          (prev ?? []).map((x) =>
                            x.cliente_plan_id === p.cliente_plan_id
                              ? { ...x, estado: nuevo }
                              : x,
                          ),
                        );
                        try {
                          await updatePlanEstado(p.cliente_plan_id, nuevo);
                        } catch (err) {
                          setPlanes(snapshot);
                          alert('No se pudo actualizar el estado del plan.');
                        }
                      }}
                    >
                      <option value="vigente">Vigente</option>
                      <option value="consumido">Consumido</option>
                      <option value="caducado">Caducado</option>
                      <option value="eliminado">Eliminado</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </Section>
      )}

      {/* ACTIVIDADES */}
      {tab === 'actividades' && (
        <Section>
          <div className="flex flex-wrap gap-3 items-end">
            <label className="text-sm">
              Desde
              <input
                type="date"
                className="block border rounded px-2 py-1 mt-1"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
              />
            </label>
            <label className="text-sm">
              Hasta
              <input
                type="date"
                className="block border rounded px-2 py-1 mt-1"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
              />
            </label>
            <label className="text-sm">
              Estado
              <select
                className="block border rounded px-2 py-1 mt-1"
                value={actEstado}
                onChange={(e) => setActEstado(e.target.value as any)}
              >
                <option value="todos">Todos</option>
                <option value="activa">Activa</option>
                <option value="asistida">Asistida</option>
                <option value="cancelada_a_tiempo">Cancelada a tiempo</option>
                <option value="cancelada_tarde">Cancelada tarde</option>
                <option value="ausente">Ausente</option>
              </select>
            </label>
            <label className="text-sm">
              Límite
              <input
                type="number"
                min={1}
                className="block border rounded px-2 py-1 mt-1 w-24"
                value={actLimit}
                onChange={(e) => setActLimit(Number(e.target.value || 0))}
              />
            </label>
            <button
              className="px-3 py-2 border rounded"
              onClick={async () => {
                try {
                  setLoadingAct(true);
                  setErrAct(null);
                  const data = await getActividades(clienteId, {
                    desde: desde || undefined,
                    hasta: hasta || undefined,
                    estado: actEstado === 'todos' ? undefined : actEstado,
                    limit: actLimit || undefined,
                  });
                  setActividades(data);
                } catch (e: any) {
                  setErrAct(e?.message ?? 'Error desconocido');
                } finally {
                  setLoadingAct(false);
                }
              }}
            >
              Aplicar
            </button>

            <button
              className="px-3 py-2 border rounded"
              onClick={() => {
                if (!actividades || actividades.length === 0) return;
                const rows = actividades.map((a) => ({
                  fecha: fmtDia(a.fecha),
                  hora_inicio: fmtHora(a.hora_inicio),
                  hora_fin: fmtHora(a.hora_fin),
                  sucursal_id: a.sucursal_id,
                  estado: a.estado,
                  cancelada_en: a.cancelada_en
                    ? format(new Date(a.cancelada_en), 'dd-MM-yyyy HH:mm')
                    : '',
                }));
                const csv = toCsv(rows);
                downloadCsv(`actividades_cliente_${clienteId}.csv`, csv);
              }}
            >
              Exportar CSV
            </button>
          </div>

          {loadingAct && <div>Cargando actividades…</div>}
          {errAct && <div className="text-red-600">Error: {errAct}</div>}
          {actividades?.length === 0 && <div>Sin actividades registradas.</div>}
          {actividades?.map((a) => {
            const fechaObj = new Date(`${a.fecha}T00:00:00`);
            const day = isNaN(fechaObj.getTime())
              ? a.fecha
              : format(fechaObj, 'd');
            const monthYear = isNaN(fechaObj.getTime())
              ? ''
              : format(fechaObj, 'MM - yyyy');
            const inicioTxt = `${fmtHora(a.hora_inicio)} - ${fmtHora(a.hora_fin)}`;

            const tooltip =
              a.estado === 'cancelada_a_tiempo' ||
              a.estado === 'cancelada_tarde'
                ? `Cancelada el ${a.cancelada_en ? format(new Date(a.cancelada_en), 'dd-MM-yyyy HH:mm') : 'N/D'}${
                    a.min_antes ? ` (${a.min_antes} min antes)` : ''
                  }`
                : a.estado === 'asistida'
                  ? 'Asistencia confirmada'
                  : a.estado === 'ausente'
                    ? 'No canceló y no se registró asistencia'
                    : 'Reserva activa';

            return (
              <div
                key={a.reserva_id}
                className="bg-white rounded-xl shadow p-4 flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-lg border flex flex-col items-center justify-center">
                  <div className="text-xs text-gray-500">Día</div>
                  <div className="text-lg font-semibold">{day}</div>
                  <div className="text-[10px] text-gray-500">{monthYear}</div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Clase</div>
                  <div className="text-sm text-gray-600">
                    Horario: <span className="font-medium">{inicioTxt}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Sucursal #{a.sucursal_id}
                  </div>
                </div>
                <BadgeActividad estado={a.estado} title={tooltip} />
              </div>
            );
          })}
        </Section>
      )}

      {/* PAGOS */}
      {tab === 'pagos' && (
        <Section>
          <div className="flex flex-wrap gap-3 items-end">
            <label className="text-sm">
              Estado
              <select
                className="block border rounded px-2 py-1 mt-1"
                value={pagoEstado}
                onChange={(e) => setPagoEstado(e.target.value as any)}
              >
                <option value="todos">Todos</option>
                <option value="pagado">Pagado</option>
                <option value="pendiente">Pendiente</option>
                <option value="reembolsado">Reembolsado</option>
                <option value="anulado">Anulado</option>
              </select>
            </label>
            <label className="text-sm">
              Método
              <input
                type="text"
                placeholder="TARJETA, TRANSFERENCIA…"
                className="block border rounded px-2 py-1 mt-1"
                value={pagoMetodo}
                onChange={(e) => setPagoMetodo(e.target.value)}
              />
            </label>
            <label className="text-sm">
              Límite
              <input
                type="number"
                min={1}
                className="block border rounded px-2 py-1 mt-1 w-24"
                value={pagoLimit}
                onChange={(e) => setPagoLimit(Number(e.target.value || 0))}
              />
            </label>
            <button
              className="px-3 py-2 border rounded"
              onClick={async () => {
                try {
                  setLoadingPagos(true);
                  setErrPagos(null);
                  const data = await getPagos(clienteId, {
                    estado: pagoEstado === 'todos' ? undefined : pagoEstado,
                    metodo: pagoMetodo || undefined,
                    limit: pagoLimit || undefined,
                  });
                  setPagos(data);
                } catch (e: any) {
                  setErrPagos(e?.message ?? 'Error desconocido');
                } finally {
                  setLoadingPagos(false);
                }
              }}
            >
              Aplicar
            </button>

            <button
              className="px-3 py-2 border rounded"
              onClick={() => {
                if (!pagos || pagos.length === 0) return;
                const rows = pagos.map((p) => ({
                  monto: Number(p.monto).toFixed(0),
                  metodo_pago: p.metodo_pago,
                  estado: p.estado,
                  pagado_en: p.pagado_en
                    ? format(new Date(p.pagado_en), 'dd-MM-yyyy HH:mm')
                    : '',
                  referencia: p.referencia_externa ?? '',
                }));
                const csv = toCsv(rows);
                downloadCsv(`pagos_cliente_${clienteId}.csv`, csv);
              }}
            >
              Exportar CSV
            </button>
          </div>

          {loadingPagos && <div>Cargando pagos…</div>}
          {errPagos && <div className="text-red-600">Error: {errPagos}</div>}
          {pagos?.length === 0 && <div>Sin pagos registrados.</div>}
          {pagos?.map((p) => {
            const fecha = p.pagado_en ? new Date(p.pagado_en) : null;
            const day = fecha ? format(fecha, 'd') : '—';
            const monthYear = fecha ? format(fecha, 'MM - yyyy') : '';
            const hora = fecha ? format(fecha, 'HH:mm') : '—';

            return (
              <div
                key={p.pago_id}
                className="bg-white rounded-xl shadow p-4 flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-lg border flex flex-col items-center justify-center">
                  <div className="text-xs text-gray-500">Día</div>
                  <div className="text-lg font-semibold">{day}</div>
                  <div className="text-[10px] text-gray-500">{monthYear}</div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Pago</div>
                  <div className="text-sm text-gray-600">
                    Monto:{' '}
                    <span className="font-medium">
                      {fmtMoneda(Number(p.monto))}
                    </span>{' '}
                    • Hora: <span className="font-medium">{hora}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Método: {p.metodo_pago}
                    {p.referencia_externa
                      ? ` • Ref: ${p.referencia_externa}`
                      : ''}
                  </div>
                </div>
                <Badge
                  text={p.estado}
                  className="border-slate-400 text-slate-700 bg-slate-50"
                />
              </div>
            );
          })}
        </Section>
      )}

      {/* DOCUMENTOS */}
      {tab === 'documentos' && (
        <Section>
          {/* Filtros */}
          <div className="flex flex-wrap gap-3 items-end">
            <label className="text-sm">
              Tipo
              <input
                type="text"
                placeholder="certificado, apto, etc."
                className="block border rounded px-2 py-1 mt-1"
                value={docTipoFilter}
                onChange={(e) => setDocTipoFilter(e.target.value)}
              />
            </label>
            <label className="text-sm">
              Límite
              <input
                type="number"
                min={1}
                className="block border rounded px-2 py-1 mt-1 w-24"
                value={docLimit}
                onChange={(e) => setDocLimit(Number(e.target.value || 0))}
              />
            </label>
            <button
              className="px-3 py-2 border rounded"
              onClick={async () => {
                try {
                  setLoadingDocs(true);
                  setErrDocs(null);
                  const data = await getDocumentos(clienteId, {
                    tipo: docTipoFilter || undefined,
                    limit: docLimit || undefined,
                  });
                  setDocs(data);
                } catch (e: any) {
                  setErrDocs(e?.message ?? 'Error desconocido');
                } finally {
                  setLoadingDocs(false);
                }
              }}
            >
              Aplicar
            </button>
            {docs && docs.length > 0 && (
              <button
                className="px-3 py-2 border rounded"
                onClick={() => {
                  const rows = (docs ?? []).map((d) => ({
                    nombre: d.nombre_documento,
                    tipo: d.tipo ?? '',
                    emitido_el: d.emitido_el ? fmtDia(d.emitido_el) : '',
                    vence_el: d.vence_el ? fmtDia(d.vence_el) : '',
                    actualizado: d.updated_at
                      ? format(new Date(d.updated_at), 'dd-MM-yyyy HH:mm')
                      : '',
                    url: d.url_documento,
                  }));
                  const csv = toCsv(rows);
                  downloadCsv(`documentos_cliente_${clienteId}.csv`, csv);
                }}
              >
                Exportar CSV
              </button>
            )}
          </div>

          {/* Form subir documento */}
          <div className="mt-2 p-3 border rounded-lg flex flex-wrap items-end gap-3 bg-white">
            <label className="text-sm">
              Nombre
              <input
                type="text"
                className="block border rounded px-2 py-1 mt-1"
                value={docNombre}
                onChange={(e) => setDocNombre(e.target.value)}
                placeholder="Certificado médico"
              />
            </label>
            <label className="text-sm">
              Archivo
              <input
                type="file"
                accept="application/pdf,image/*"
                className="block border rounded px-2 py-1 mt-1"
                onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <label className="text-sm">
              Tipo (opcional)
              <input
                type="text"
                className="block border rounded px-2 py-1 mt-1"
                value={docTipoForm}
                onChange={(e) => setDocTipoForm(e.target.value)}
                placeholder="certificado_medico"
              />
            </label>
            <button
              type="button"
              className="px-3 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
              onClick={async () => {
                if (!docNombre || !docFile) {
                  alert('Nombre y archivo son obligatorios');
                  return;
                }
                try {
                  setLoadingDocs(true);
                  await uploadClienteDocumento(clienteId, {
                    nombre_documento: docNombre,
                    archivo: docFile,
                    tipo: docTipoForm || undefined,
                  });
                  // recargar lista respetando filtros
                  const data = await getDocumentos(clienteId, {
                    tipo: docTipoFilter || undefined,
                    limit: docLimit || undefined,
                  });
                  setDocs(data);
                  setDocNombre('');
                  setDocTipoForm('');
                  setDocFile(null);
                } catch (e: any) {
                  alert(e?.message ?? 'No se pudo subir el documento');
                } finally {
                  setLoadingDocs(false);
                }
              }}
            >
              Subir
            </button>
          </div>

          {loadingDocs && <div>Cargando documentos…</div>}
          {errDocs && <div className="text-red-600">Error: {errDocs}</div>}
          {docs?.length === 0 && <div>Sin documentos.</div>}
          {docs?.map((d) => (
            <div
              key={d.documento_id}
              className="bg-white rounded-xl shadow p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold">{d.nombre_documento}</div>
                <div className="text-sm text-gray-600">
                  {(d.tipo ?? '—') +
                    ' • emitido: ' +
                    (d.emitido_el ? fmtDia(d.emitido_el) : '—') +
                    ' • vence: ' +
                    (d.vence_el ? fmtDia(d.vence_el) : '—')}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={d.url_documento}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline"
                >
                  Ver
                </a>
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50"
                  onClick={async () => {
                    if (!confirm('¿Eliminar este documento?')) return;
                    try {
                      setLoadingDocs(true);
                      await deleteClienteDocumento(d.documento_id);
                      const data = await getDocumentos(clienteId, {
                        tipo: docTipoFilter || undefined,
                        limit: docLimit || undefined,
                      });
                      setDocs(data);
                    } catch (e: any) {
                      alert(e?.message ?? 'No se pudo eliminar el documento');
                    } finally {
                      setLoadingDocs(false);
                    }
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}
