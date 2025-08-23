import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RiFileList2Line, RiBankCardLine, RiCheckLine } from 'react-icons/ri';

// --- Tipos ---
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

const toCLP = (n: number) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n);

const AsignarPlan: React.FC = () => {
  const { id: clienteIdParam } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const clienteId = Number(clienteIdParam);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [planSeleccionado, setPlanSeleccionado] = useState<Plan | null>(null);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] =
    useState<MetodoPago | null>(null);

  const hoyISO = new Date().toISOString().split('T')[0];
  const [fechaInicio, setFechaInicio] = useState<string>(hoyISO);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // --- Cargar catálogo de planes y métodos ---
  useEffect(() => {
    let cancelled = false;
    const cargarDatos = async () => {
      setCargando(true);
      setError(null);
      try {
        const [resPlanes, resMetodos] = await Promise.all([
          fetch(`${API_BASE_URL}/planes`),
          fetch(`${API_BASE_URL}/metodos-pago`),
        ]);
        if (!resPlanes.ok)
          throw new Error(
            `No se pudieron cargar planes (HTTP ${resPlanes.status})`,
          );
        if (!resMetodos.ok)
          throw new Error(
            `No se pudieron cargar métodos de pago (HTTP ${resMetodos.status})`,
          );

        const dataPlanes: Plan[] = await resPlanes.json();
        const dataMetodos: MetodoPago[] = await resMetodos.json();

        if (cancelled) return;
        setPlanes(dataPlanes);
        setMetodosPago(dataMetodos);

        // Preseleccionar método si solo hay uno
        if (dataMetodos.length === 1) setMetodoPagoSeleccionado(dataMetodos[0]);
      } catch (err: any) {
        if (!cancelled)
          setError(err?.message || 'Error al cargar datos iniciales.');
      } finally {
        if (!cancelled) setCargando(false);
      }
    };
    cargarDatos();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Guardar asignación de plan ---
  const handleAsignarPlan = async () => {
    if (!clienteId || Number.isNaN(clienteId)) {
      setError('ID de alumna inválido.');
      return;
    }
    if (!planSeleccionado || !metodoPagoSeleccionado) {
      setError('Debes seleccionar un plan y un método de pago.');
      return;
    }
    if (!fechaInicio) {
      setError('Debes seleccionar la fecha de inicio.');
      return;
    }

    setGuardando(true);
    setError(null);
    setOkMsg(null);

    try {
      const res = await fetch(`${API_BASE_URL}/cliente-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          cliente_id: clienteId, // <- numérico
          plan_id: planSeleccionado.id,
          fecha_inicio: fechaInicio,
          // Nota: guardamos solo la asignación; el método de pago se usa a nivel de UI.
          // Si en el futuro hay endpoint de pagos, aquí podemos crear el pago asociado.
        }),
      });

      if (!res.ok) {
        let msg = `No se pudo asignar el plan (HTTP ${res.status})`;
        try {
          const j = await res.json();
          if (j?.message) msg = j.message;
        } catch {}
        throw new Error(msg);
      }

      setOkMsg('¡Plan asignado con éxito!');
      // Redirigimos al nuevo Dashboard de Alumna
      navigate(`/alumna/${clienteId}`);
    } catch (err: any) {
      setError(err?.message || 'Error desconocido al asignar el plan.');
    } finally {
      setGuardando(false);
    }
  };

  if (!clienteIdParam) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg">
          Falta el parámetro <code>:id</code> en la ruta.
        </div>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="p-8 text-center text-gray-500">Cargando catálogo…</div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Asignar Plan a Alumna
      </h1>

      <div className="space-y-6">
        {/* — Selección de Plan — */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-3 mb-4">
            <RiFileList2Line className="text-purple-500" /> Selección de
            Plan/Servicio
          </h2>

          {planSeleccionado ? (
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-bold text-purple-800">
                  {planSeleccionado.nombre}
                </p>
                <p className="text-sm text-purple-600">
                  {planSeleccionado.descripcion}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-purple-800">
                  {toCLP(planSeleccionado.precio)}
                </p>
                <button
                  onClick={() => setPlanSeleccionado(null)}
                  className="text-sm text-red-600 hover:underline mt-1"
                >
                  Cambiar selección
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-72 rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="border-b">
                    <th className="p-3 text-left font-semibold text-gray-600">
                      Nombre
                    </th>
                    <th className="p-3 text-left font-semibold text-gray-600">
                      Descripción
                    </th>
                    <th className="p-3 text-right font-semibold text-gray-600">
                      Precio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {planes.map((plan) => (
                    <tr
                      key={plan.id}
                      onClick={() => setPlanSeleccionado(plan)}
                      className="border-b hover:bg-purple-50 cursor-pointer"
                    >
                      <td className="p-3 font-medium">{plan.nombre}</td>
                      <td className="p-3 text-gray-600">{plan.descripcion}</td>
                      <td className="p-3 text-right font-semibold">
                        {toCLP(plan.precio)}
                      </td>
                    </tr>
                  ))}
                  {planes.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-500">
                        No hay planes disponibles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* — Método de pago — */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-3 mb-4">
            <RiBankCardLine className="text-purple-500" /> Método de Pago
          </h2>

          <div className="flex flex-wrap gap-3">
            {metodosPago.map((metodo) => {
              const activo = metodoPagoSeleccionado?.id === metodo.id;
              return (
                <button
                  key={metodo.id}
                  type="button"
                  onClick={() => setMetodoPagoSeleccionado(metodo)}
                  className={`py-2 px-4 rounded-lg border-2 transition-all ${
                    activo
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-800'
                  }`}
                >
                  {metodo.nombre}
                </button>
              );
            })}
            {metodosPago.length === 0 && (
              <div className="text-gray-500 text-sm">
                No hay métodos de pago configurados.
              </div>
            )}
          </div>
        </div>

        {/* — Fecha de inicio — */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <label
            htmlFor="fecha_inicio"
            className="block text-xl font-semibold text-gray-700 mb-2"
          >
            Fecha de Inicio del Plan
          </label>
          <input
            type="date"
            id="fecha_inicio"
            name="fecha_inicio"
            value={fechaInicio}
            min={hoyISO}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="bg-gray-100 outline-none py-2 px-4 rounded-lg border-2 border-gray-200 focus:border-purple-500"
          />
          <p className="text-xs text-gray-500 mt-2">
            * No permitimos fechas en el pasado.
          </p>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
            <strong>Error: </strong>
            {error}
          </div>
        )}
        {okMsg && (
          <div className="text-green-700 bg-green-50 border border-green-200 p-3 rounded-lg">
            {okMsg}
          </div>
        )}

        {/* Acción */}
        <div className="flex justify-end">
          <button
            onClick={handleAsignarPlan}
            disabled={
              guardando ||
              !planSeleccionado ||
              !metodoPagoSeleccionado ||
              !fechaInicio
            }
            className="flex items-center justify-center gap-2 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300 disabled:cursor-not-allowed"
          >
            <RiCheckLine />
            {guardando ? 'Asignando…' : 'Confirmar y Asignar Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AsignarPlan;
