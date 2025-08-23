import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addMinutes } from 'date-fns';

// --- Interfaces para los datos de la API ---
interface Sucursal {
  id: number;
  nombre: string;
}

interface Servicio {
  id: number;
  nombre: string;
}

interface Empleado {
  id: number;
  nombre: string;
  apellido_paterno: string;
}

// --- Interfaz para los datos del formulario (actualizada) ---
interface ClaseFormData {
  sucursal_id: string;
  servicio_id: string;
  empleado_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string; // Se mantiene para enviarlo al backend
  recurrencia: 'no_recurre' | '1_mes' | '6_meses' | 'personalizada';
  fecha_fin_recurrencia?: string;
}

const ClaseForm: React.FC = () => {
  const navigate = useNavigate();

  // --- Estados para los datos de los selectores ---
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);

  // --- Estado para el formulario (actualizado) ---
  const [formData, setFormData] = useState<ClaseFormData>({
    sucursal_id: '',
    servicio_id: '',
    empleado_id: '',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    hora_inicio: '09:00',
    hora_fin: '09:50',
    recurrencia: 'no_recurre',
    fecha_fin_recurrencia: '',
  });

  // --- Estados para la UI ---
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- Efecto para cargar datos de los selectores ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [sucursalesRes, serviciosRes, empleadosRes] = await Promise.all([
          fetch('https://api.espaciopilatescl.cl/api/sucursales'),
          fetch('https://api.espaciopilatescl.cl/api/servicios'),
          fetch('https://api.espaciopilatescl.cl/api/empleados'),
        ]);

        if (!sucursalesRes.ok || !serviciosRes.ok || !empleadosRes.ok) {
          throw new Error(
            'No se pudieron cargar los datos para el formulario.',
          );
        }

        setSucursales(await sucursalesRes.json());
        setServicios(await serviciosRes.json());
        setEmpleados(await empleadosRes.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchInitialData();
  }, []);

  // --- Efecto para calcular la hora de fin automáticamente ---
  useEffect(() => {
    if (formData.hora_inicio) {
      try {
        const fechaBase = new Date(`1970-01-01T${formData.hora_inicio}`);
        const nuevaFechaFin = addMinutes(fechaBase, 50);
        const nuevaHoraFin = format(nuevaFechaFin, 'HH:mm');
        setFormData((prevState) => ({ ...prevState, hora_fin: nuevaHoraFin }));
      } catch (e) {
        console.error('Hora de inicio inválida para el cálculo.');
      }
    }
  }, [formData.hora_inicio]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  // --- FUNCIÓN DE VALIDACIÓN ACTUALIZADA ---
  const validateForm = (): boolean => {
    // 1. Validar que la fecha de la clase no sea en el pasado
    const today = format(new Date(), 'yyyy-MM-dd');
    if (formData.fecha < today) {
      setError('No se puede programar una clase en una fecha pasada.');
      return false;
    }

    // 2. Validar la fecha de recurrencia personalizada
    if (formData.recurrencia === 'personalizada') {
      if (!formData.fecha_fin_recurrencia) {
        setError(
          'Debe seleccionar una fecha de fin para la recurrencia personalizada.',
        );
        return false;
      }
      if (formData.fecha_fin_recurrencia < formData.fecha) {
        setError(
          'La fecha de fin de la recurrencia no puede ser anterior a la fecha de inicio.',
        );
        return false;
      }
    }
    setError(null); // Si todo está bien, limpiar errores previos
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setGuardando(true);
    setError(null);

    try {
      const response = await fetch(
        'https://api.espaciopilatescl.cl/api/clases',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.message || 'Ocurrió un error al guardar la clase.';
        throw new Error(errorMessage);
      }
      navigate('/calendario');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="p-8 text-center">Cargando datos...</div>;

  const inputStyle =
    'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-purple-500 focus:border-purple-500';
  const labelStyle = 'block text-sm font-medium text-gray-700';

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Programar Nueva Clase
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 md:p-8 rounded-xl shadow-md max-w-4xl mx-auto"
      >
        <div className="mb-6">
          <label htmlFor="fecha" className={labelStyle}>
            Fecha de la Clase
          </label>
          {/* --- CAMPO DE FECHA ACTUALIZADO CON RESTRICCIÓN --- */}
          <input
            type="date"
            name="fecha"
            id="fecha"
            value={formData.fecha}
            onChange={handleInputChange}
            required
            className={inputStyle}
            min={format(new Date(), 'yyyy-MM-dd')} // No permite seleccionar fechas pasadas
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="sucursal_id" className={labelStyle}>
              Sucursal
            </label>
            <select
              name="sucursal_id"
              id="sucursal_id"
              value={formData.sucursal_id}
              onChange={handleInputChange}
              required
              className={inputStyle}
            >
              <option value="">Seleccione sucursal</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="servicio_id" className={labelStyle}>
              Servicio
            </label>
            <select
              name="servicio_id"
              id="servicio_id"
              value={formData.servicio_id}
              onChange={handleInputChange}
              required
              className={inputStyle}
            >
              <option value="">Seleccione servicio</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="empleado_id" className={labelStyle}>
              Monitor
            </label>
            <select
              name="empleado_id"
              id="empleado_id"
              value={formData.empleado_id}
              onChange={handleInputChange}
              required
              className={inputStyle}
            >
              <option value="">Seleccione monitor</option>
              {empleados.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre} {e.apellido_paterno}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="recurrencia" className={labelStyle}>
              Recurrencia
            </label>
            <select
              name="recurrencia"
              id="recurrencia"
              value={formData.recurrencia}
              onChange={handleInputChange}
              className={inputStyle}
            >
              <option value="no_recurre">No Recurre</option>
              <option value="1_mes">Repetir por 1 mes</option>
              <option value="6_meses">Repetir por 6 meses</option>
              <option value="personalizada">Personalizada</option>
            </select>
          </div>
          {formData.recurrencia === 'personalizada' && (
            <div>
              <label htmlFor="fecha_fin_recurrencia" className={labelStyle}>
                Repetir hasta el
              </label>
              <input
                type="date"
                name="fecha_fin_recurrencia"
                id="fecha_fin_recurrencia"
                value={formData.fecha_fin_recurrencia}
                onChange={handleInputChange}
                required
                className={inputStyle}
                min={formData.fecha} // No permite seleccionar una fecha anterior a la de inicio
              />
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="hora_inicio" className={labelStyle}>
              Hora Inicio
            </label>
            <input
              type="time"
              name="hora_inicio"
              id="hora_inicio"
              value={formData.hora_inicio}
              onChange={handleInputChange}
              required
              className={inputStyle}
            />
          </div>
          <div>
            <label className={labelStyle}>Hora Fin (Automática)</label>
            <div className={`${inputStyle} bg-gray-200 text-gray-600`}>
              {formData.hora_fin}
            </div>
          </div>
        </div>
        {error && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}
        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/calendario')}
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300"
          >
            {guardando ? 'Guardando...' : 'Guardar Clase'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClaseForm;
