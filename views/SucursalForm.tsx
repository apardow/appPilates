import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Interfaz actualizada para incluir la URL de la foto
interface SucursalData {
    nombre: string;
    codigo: string;
    direccion: string;
    habilitado: boolean | number;
    foto_url?: string | null;
}

const SucursalForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [sucursal, setSucursal] = useState<SucursalData>({
        nombre: '',
        codigo: '',
        direccion: '',
        habilitado: 1,
        foto_url: null,
    });

    // Nuevos estados para manejar el archivo de la foto y su previsualización
    const [foto, setFoto] = useState<File | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);

    const [cargando, setCargando] = useState<boolean>(false);
    const [guardando, setGuardando] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const isEditing = Boolean(id);

    // --- useEffect CORREGIDO usando el patrón de EmpleadoForm.tsx ---
    useEffect(() => {
        const fetchSucursalData = async () => {
            if (isEditing) {
                setCargando(true);
                try {
                    const response = await fetch(`https://api.espaciopilatescl.cl/api/sucursales/${id}`);
                    if (!response.ok) {
                        throw new Error('No se pudo encontrar la sucursal.');
                    }
                    const data: SucursalData = await response.json();
                    setSucursal(data);
                    if (data.foto_url) {
                        setFotoPreview(data.foto_url);
                    }
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setCargando(false);
                }
            }
        };

        fetchSucursalData();
    }, [id, isEditing]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isToggle = name === 'habilitado';
        setSucursal(prevState => ({ 
            ...prevState, 
            [name]: isToggle ? Number(value) : value 
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFoto(file);
            setFotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setGuardando(true);
        setError(null);

        const formData = new FormData();
        formData.append('nombre', sucursal.nombre);
        formData.append('direccion', sucursal.direccion);
        formData.append('habilitado', String(sucursal.habilitado));
        
        if (foto) {
            formData.append('foto', foto);
        }

        if (isEditing) {
            formData.append('_method', 'PUT');
            // --- CORRECCIÓN: Se añade el código al actualizar ---
            formData.append('codigo', sucursal.codigo);
        }

        const url = isEditing 
            ? `https://api.espaciopilatescl.cl/api/sucursales/${id}` 
            : 'https://api.espaciopilatescl.cl/api/sucursales';
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Ocurrió un error al guardar.';
                throw new Error(errorMessage);
            }
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
                    {isEditing && (
                        <div>
                            <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">Código</label>
                            <input
                                type="text"
                                name="codigo"
                                id="codigo"
                                value={sucursal.codigo}
                                readOnly
                                className={`${inputStyle} bg-gray-200 cursor-not-allowed`}
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">Dirección</label>
                        <input type="text" name="direccion" id="direccion" value={sucursal.direccion} onChange={handleInputChange} required className={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="foto" className="block text-sm font-medium text-gray-700">Foto de la Sucursal</label>
                        <input type="file" name="foto" id="foto" onChange={handleFileChange} accept="image/*" className={`${inputStyle} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100`} />
                        {fotoPreview && (
                            <div className="mt-4">
                                <img src={fotoPreview} alt="Vista previa de la sucursal" className="w-full h-48 object-cover rounded-md" />
                            </div>
                        )}
                    </div>
                    <div>
                        <label htmlFor="habilitado" className="block text-sm font-medium text-gray-700">Estado</label>
                        <select name="habilitado" id="habilitado" value={Number(sucursal.habilitado)} onChange={handleInputChange} className={inputStyle}>
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
