import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// --- Definición de Tipos ---
// Se alinea con la estructura de SucursalForm, usando número para 'habilitado'
interface PlanData {
    nombre: string;
    descripcion: string;
    precio: number;
    duracion_dias: number;
    cantidad_clases: number;
    habilitado: number; // Usamos 1 para true, 0 para false
}

const API_BASE_URL = 'https://api.espaciopilatescl.cl/api';

const PlanForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    // Se adopta la misma estructura de estado que en los formularios que funcionan
    const [formData, setFormData] = useState<PlanData>({
        nombre: '',
        descripcion: '',
        precio: 0,
        duracion_dias: 30,
        cantidad_clases: 4,
        habilitado: 1,
    });

    const [loading, setLoading] = useState<boolean>(isEditing);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            fetch(`${API_BASE_URL}/planes/${id}`)
                .then(res => {
                    if (!res.ok) throw new Error('No se pudo cargar la información del plan.');
                    return res.json();
                })
                .then((data: PlanData) => {
                    // Se asegura de que los datos recibidos sean válidos antes de actualizar el estado
                    setFormData({
                        nombre: data.nombre || '',
                        descripcion: data.descripcion || '',
                        precio: data.precio || 0,
                        duracion_dias: data.duracion_dias || 0,
                        cantidad_clases: data.cantidad_clases || 0,
                        habilitado: data.habilitado === 0 ? 0 : 1,
                    });
                })
                .catch(() => setError('No se pudo cargar la información del plan.'))
                .finally(() => setLoading(false));
        }
    }, [id, isEditing]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumericField = ['precio', 'duracion_dias', 'cantidad_clases', 'habilitado'].includes(name);
        
        setFormData(prev => ({
            ...prev,
            [name]: isNumericField ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const url = isEditing ? `${API_BASE_URL}/planes/${id}` : `${API_BASE_URL}/planes`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Ocurrió un error al guardar el plan.');
            navigate('/planes');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando...</div>;

    const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-purple-500 focus:border-purple-500";

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{isEditing ? 'Editar Plan' : 'Agregar Nuevo Plan'}</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Columna 1 */}
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre del Plan</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required className={inputStyle} />
                        </div>
                        <div>
                            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
                            <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} rows={3} className={inputStyle}></textarea>
                        </div>
                        <div>
                            <label htmlFor="precio" className="block text-sm font-medium text-gray-700">Precio (CLP)</label>
                            <input type="number" name="precio" value={formData.precio} onChange={handleInputChange} required className={inputStyle} />
                        </div>
                    </div>
                    {/* Columna 2 */}
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="duracion_dias" className="block text-sm font-medium text-gray-700">Duración (en días)</label>
                            <input type="number" name="duracion_dias" value={formData.duracion_dias} onChange={handleInputChange} required className={inputStyle} />
                        </div>
                        <div>
                            <label htmlFor="cantidad_clases" className="block text-sm font-medium text-gray-700">Cantidad de Clases</label>
                            <input type="number" name="cantidad_clases" value={formData.cantidad_clases} onChange={handleInputChange} required className={inputStyle} />
                        </div>
                        <div>
                            <label htmlFor="habilitado" className="block text-sm font-medium text-gray-700">Estado</label>
                            <select name="habilitado" value={formData.habilitado} onChange={handleInputChange} className={inputStyle}>
                                <option value={1}>Habilitado</option>
                                <option value={0}>Deshabilitado</option>
                            </select>
                        </div>
                    </div>
                </div>
                {error && <div className="mt-6 text-red-600"><strong>Error:</strong> {error}</div>}
                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={() => navigate('/planes')} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-300">
                        {isSubmitting ? 'Guardando...' : 'Guardar Plan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PlanForm;
