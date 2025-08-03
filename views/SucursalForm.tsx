import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface SucursalData {
    nombre: string;
    codigo: string;
    direccion: string;
    habilitado: boolean | number;
}

const SucursalForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [sucursal, setSucursal] = useState<SucursalData>({
        nombre: '',
        codigo: '',
        direccion: '',
        habilitado: 1, // Por defecto, una nueva sucursal está habilitada
    });

    const [cargando, setCargando] = useState<boolean>(false);
    const [guardando, setGuardando] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const isEditing = Boolean(id);

    useEffect(() => {
        if (isEditing) {
            setCargando(true);
            fetch(`https://api.espaciopilatescl.cl/api/sucursales/${id}`)
                .then(res => res.json())
                .then((data: SucursalData) => setSucursal(data))
                .catch(() => setError('No se pudo cargar la información de la sucursal.'))
                .finally(() => setCargando(false));
        }
    }, [id, isEditing]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isToggle = name === 'habilitado';
        setSucursal(prevState => ({ 
            ...prevState, 
            [name]: isToggle ? Number(value) : value 
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setGuardando(true);
        setError(null);

        // Al crear, enviamos un objeto sin el campo 'codigo' para que el backend lo genere
        const dataToSend = isEditing ? sucursal : { ...sucursal, codigo: '' };

        const url = isEditing ? `https://api.espaciopilatescl.cl/api/sucursales/${id}` : 'https://api.espaciopilatescl.cl/api/sucursales';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(dataToSend)
            });
            if (!response.ok) throw new Error('Ocurrió un error al guardar la sucursal.');
            navigate('/sucursales');
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
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{isEditing ? 'Editar Sucursal' : 'Agregar Nueva Sucursal'}</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input type="text" name="nombre" id="nombre" value={sucursal.nombre} onChange={handleInputChange} required className={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">Código</label>
                        <input
                            type="text"
                            name="codigo"
                            id="codigo"
                            value={sucursal.codigo}
                            onChange={handleInputChange}
                            required={isEditing} // El código solo es requerido si estamos editando
                            disabled={!isEditing} // El campo está deshabilitado al crear
                            placeholder={isEditing ? 'Código existente' : 'Se generará automáticamente'}
                            className={`${inputStyle} disabled:bg-gray-200 disabled:cursor-not-allowed`}
                        />
                    </div>
                    <div>
                        <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">Dirección</label>
                        <input type="text" name="direccion" id="direccion" value={sucursal.direccion} onChange={handleInputChange} required className={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="habilitado" className="block text-sm font-medium text-gray-700">Estado</label>
                        <select name="habilitado" id="habilitado" value={sucursal.habilitado} onChange={handleInputChange} className={inputStyle}>
                            <option value={1}>Habilitado</option>
                            <option value={0}>Deshabilitado</option>
                        </select>
                    </div>
                </div>
                {error && <div className="mt-6 text-red-600"><strong>Error:</strong> {error}</div>}
                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={() => navigate('/sucursales')} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button type="submit" disabled={guardando} className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-300">
                        {guardando ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SucursalForm;
