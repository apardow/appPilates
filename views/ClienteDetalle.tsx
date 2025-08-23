import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { RiAddLine, RiPencilLine, RiDashboardLine } from 'react-icons/ri';
import { format } from 'date-fns';

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
  fecha_inicio: string | null;
  fecha_fin: string | null;
  clases_restantes: number;
  estado: string; // 'vigente' | 'consumido' | 'caducado' | 'eliminado' | 'activo' (legacy)
  plan: {
    nombre: string;
    precio: number;
    cantidad_clases: number;
  };
}

const API_BASE_URL = 'https://api.espaciopilatescl.cl/api';

// Helpers de formato
const fmtCLP = (n: number) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n);

const fmtFecha = (d: string | null) => {
  if (!d) return '—';
  const date = new Date(d);
  return isNaN(date.getTime()) ? d : format(date, 'dd-MM-yyyy');
};

const isPlanVigente = (estado: string) => {
  const e = (estado || '').toLowerCase();
  return e === 'vigente' || e === 'activo'; // compatibilidad hacia atrás
};

const pct = (used: number, total: number) => {
  if (!Number.isFinite(total) || total <= 0) return 0;
  const p = (used / total) * 100;
  return Math.max(0, Math.min(100, p));
};

const badgeClassByEstado = (estado: string) => {
  const e = (estado || '').toLowerCase();
  if (e === 'vigente' || e === 'activo')
    return 'border-green-600 text-green-700 bg-green-50';
  if (e === 'consumido') return 'border-blue-700 text-blue-700 bg-blue-50';
  if (e === 'caducado') return 'border-yellow-700 text-yellow-800 bg-yellow-50';
  if (e === 'eliminado') return 'border-red-700 text-red-700 bg-red-50';
  return 'border-slate-400 text-slate-700 bg-slate-50';
};

const ClienteDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [planes, setPlanes] = useState<PlanAsignado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const cargarDatosCliente = async () => {
      setCargando(true);
      try {
        const [resCliente, resPlanes] = await Promise.all([
          fetch(`${API_BASE_URL}/clientes/${id}`),
          fetch(`${API_BASE_URL}/clientes/${id}/planes`),
        ]);
        if (!resCliente.ok || !resPlanes.ok)
          throw new Error('No se pudieron cargar los datos de la alumna.');

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
    void cargarDatosCliente();
  }, [id]);

  if (cargando) return <div className="p-8 text-center">Cargando...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!cliente)
    return <div className="p-8 text-center">Alumna no encontrada.</div>;

  const planesActivos = planes.filter((p) => isPlanVigente(p.estado)).length;

  return (
    <div className="p-4 md:p-8">
      {/* Cabecera del Perfil */}
      <div className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 bg-purple-200 rounded-full flex items-center justify-center text-purple-600 text-4xl font-bold">
            {cliente.nombre.charAt(0)}
            {cliente.apellido.charAt(0)}
          </div>
          {/* --- Asignar plan --- */}
          <Link
            to={`/clientes/${cliente.id}/asignar-plan`}
            className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2 hover:bg-green-600 transition-transform duration-200 hover:scale-110"
            title="Asignar nuevo plan"
          >
            <RiAddLine size={20} />
          </Link>
        </div>

        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-800">
            {cliente.nombre} {cliente.apellido}
          </h1>
          <p className="text-gray-500">{planesActivos} Plan(es) Vigente(s)</p>
        </div>

        <div className="md:ml-auto flex flex-col gap-3 self-stretch">
          <div className="border rounded-lg p-4 text-sm bg-gray-50">
            <h3 className="font-bold mb-2 text-gray-700">Datos de la alumna</h3>
            <p>
              <strong>RUT:</strong> {cliente.rut}
            </p>
            <p>
              <strong>Email:</strong> {cliente.usuario.email}
            </p>
            <p>
              <strong>Teléfono:</strong> {cliente.telefono}
            </p>
          </div>
          {/* --- Botón Ver Dashboard --- */}
          <Link
            to={`/alumna/${cliente.id}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            title="Ver Dashboard de Alumna"
          >
            <RiDashboardLine />
            Ver Dashboard
          </Link>
        </div>
      </div>

      {/* Planes comprados */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Planes Comprados
        </h3>
        <div className="space-y-4">
          {planes.length > 0 ? (
            planes.map((plan) => {
              const total = Number(plan.plan.cantidad_clases) || 0;
              const usadas = Math.max(
                0,
                total - Number(plan.clases_restantes || 0),
              );
              const porcentaje = pct(usadas, total);

              return (
                <div
                  key={plan.id}
                  className="bg-white p-4 rounded-xl shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-800">
                      {plan.plan.nombre}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded border uppercase ${badgeClassByEstado(plan.estado)}`}
                      >
                        {plan.estado}
                      </span>
                      <button className="text-orange-500" title="Editar plan">
                        <RiPencilLine />
                      </button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mt-2 space-y-1">
                    <p>
                      <strong>Precio:</strong>{' '}
                      {fmtCLP(Number(plan.plan.precio))}
                    </p>
                    <p>
                      <strong>Fechas:</strong> Inicio:{' '}
                      {fmtFecha(plan.fecha_inicio)} | Término:{' '}
                      {fmtFecha(plan.fecha_fin)}
                    </p>
                    <div>
                      <p className="mb-1">
                        <strong>Consumo:</strong>
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-500 h-2.5 rounded-full"
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                      <p className="text-xs text-right mt-1">
                        {usadas} / {total}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 italic">
              Esta alumna no tiene planes asignados.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClienteDetalle;
