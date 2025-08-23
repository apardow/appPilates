import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://api.espaciopilatescl.cl/api';

interface ServicioFormData {
  nombre: string;
  descripcion: string;
  capacidad: number | string; // string mientras tipean, número al enviar
}

const ServicioForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<ServicioFormData>({
    nombre: '',
    descripcion: '',
    capacidad: 10, // valor por defecto visible en el form
  });

  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar detalle si se edita
  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/servicios/${id}`);
        if (!res.ok) throw new Error('No se pudo encontrar el servicio.');
        const data = await res.json();

        // Soportar tanto "capacidad" como "capacidad_alumnos" (compatibilidad)
        const capacidadValue = data.capacidad ?? data.capacidad_alumnos ?? 10;

        setFormData({
          nombre: data.nombre ?? '',
          descripcion: data.descripcion ?? '',
          capacidad: Number.isFinite(Number(capacidadValue))
            ? Number(capacidadValue)
            : 10,
        });
      } catch (e: any) {
        setError(e?.message || 'Error cargando el servicio.');
      } finally {
        setCargando(false);
      }
    })();
  }, [id, isEditing]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    // Saneamos la capacidad para que no se vaya a cosas raras
    if (name === 'capacidad') {
      // Permitimos vacío mientras escribe; si no, número entre 1 y 100
      const raw = value;
      if (raw === '') {
        setFormData((prev) => ({ ...prev, capacidad: '' }));
      } else {
        const n = Number(raw);
        const bounded = isNaN(n) ? '' : Math.max(1, Math.min(100, n));
        setFormData((prev) => ({ ...prev, capacidad: bounded }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    try {
      const url = isEditing
        ? `${API_BASE_URL}/servicios/${id}`
        : `${API_BASE_URL}/servicios`;
      const method = isEditing ? 'PUT' : 'POST';

      // Convertimos capacidad a número seguro (mínimo 1)
      const capacidadNum = Math.max(1, Number(formData.capacidad) || 0);

      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        capacidad: capacidadNum, // <- nombre usado por el backend propuesto
        // compat opcional por si el backend heredado espera este nombre:
        capacidad_alumnos: capacidadNum, // <- se ignora si no es fillable
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Intentamos leer json para mensaje útil
        let data: any = {};
        try {
          data = await response.json();
        } catch {
          // noop
        }

        if (response.status === 422 && data) {
          // Errores de validación tipo Laravel
          const validationErrors = Object.values(data).flat().join(' ');
          throw new Error(validationErrors || 'Errores de validación.');
        }

        if (response.status === 409) {
          // Conflictos (p. ej., relaciones/FK al eliminar o update inválido)
          throw new Error(
            data?.message ||
              'No se pudo completar la operación por un conflicto.',
          );
        }

        throw new Error(data?.message || 'Ocurrió un error al guardar.');
      }

      navigate('/servicios');
    } catch (err: any) {
      setError(err?.message || 'Error desconocido al guardar.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="p-8 text-center">Cargando datos del servicio...</div>
    );
  }

  const inputStyle =
    'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-purple-500 focus:border-purple-500';

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Editar Servicio' : 'Agregar Nuevo Servicio'}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div className="md:col-span-2">
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre del Servicio
            </label>
            <input
              type="text"
              name="nombre"
              id="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
              className={inputStyle}
            />
          </div>

          {/* Capacidad */}
          <div className="md:col-span-2">
            <label
              htmlFor="capacidad"
              className="block text-sm font-medium text-gray-700"
            >
              Capacidad de Alumnos
            </label>
            <input
              type="number"
              name="capacidad"
              id="capacidad"
              min={1}
              max={100}
              value={formData.capacidad}
              onChange={handleInputChange}
              required
              className={inputStyle}
            />
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label
              htmlFor="descripcion"
              className="block text-sm font-medium text-gray-700"
            >
              Descripción (Opcional)
            </label>
            <textarea
              name="descripcion"
              id="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows={4}
              className={inputStyle}
            />
          </div>
        </div>

        {error && (
          <div className="my-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/servicios')}
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300"
          >
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServicioForm;
