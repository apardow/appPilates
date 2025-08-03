import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface PagoFormData {
    nombre: string;
    descripcion: string;
    habilitado: number;
}

const PagoForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState<PagoFormData>({
        nombre: '',
        descripcion: '',
        habilitado: 1,
    });
    
    const [cargando, setCargando] = useState<boolean>(false);
    const [guardando, setGuardando] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEditing) {
            setCargando(true);
            fetch(`https://api.espaciopilatescl.cl/api/metodos-pago/${id}`)
                .then(res => res.json())
                .then((data: PagoFormData) => setFormData(data))
                .catch(() => setError('No se pudo cargar la información del método de pago.'))
                .finally(() => setCargando(false));
        }
    }, [id, isEditing]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'habilitado' ? Number(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setGuardando(true);
        setError(null);

        const url = isEditing ? `https://api.espaciopilatescl.cl/api/metodos-pago/${id}` : 'https://api.espaciopilatescl.cl/api/metodos-pago';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Ocurrió un error al guardar.');
            navigate('/pagos');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) return <div className="p-8 text-center">Cargando...</div>;

    const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-purple-500 focus:border-purple-500";

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{isEditing ? 'Editar Método de Pago' : 'Agregar Método de Pago'}</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required className={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
                        <input type="text" name="descripcion" value={formData.descripcion} onChange={handleInputChange} required className={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="habilitado" className="block text-sm font-medium text-gray-700">Estado</label>
                        <select name="habilitado" value={formData.habilitado} onChange={handleInputChange} className={inputStyle}>
                            <option value={1}>Habilitado</option>
                            <option value={0}>Deshabilitado</option>
                        </select>
                    </div>
                </div>
                {error && <div className="mt-6 text-red-600"><strong>Error:</strong> {error}</div>}
                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={() => navigate('/pagos')} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button type="submit" disabled={guardando} className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-300">
                        {guardando ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PagoForm;
