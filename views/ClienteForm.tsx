import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Interfaz que espera los datos del cliente y el usuario anidado
interface ClienteConUsuario {
    nombre: string;
    apellido: string;
    rut: string | null;
    genero: string | null;
    telefono: string | null;
    fecha_nacimiento: string | null;
    direccion: string | null;
    comuna: string | null;
    usuario: { // Objeto de usuario anidado
        email: string;
    };
}

// Interfaz para el estado del formulario (plano)
interface ClienteFormData {
    nombre: string;
    apellido: string;
    email: string; // El email se maneja en el nivel superior para facilidad de uso en el form
    rut: string | null;
    genero: string | null;
    telefono: string | null;
    fecha_nacimiento: string | null;
    direccion: string | null;
    comuna: string | null;
}

const ClienteForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [cliente, setCliente] = useState<ClienteFormData>({
        nombre: '',
        apellido: '',
        email: '',
        rut: '',
        genero: '',
        telefono: '',
        fecha_nacimiento: '',
        direccion: '',
        comuna: '',
    });

    const [cargando, setCargando] = useState<boolean>(false);
    const [guardando, setGuardando] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const isEditing = Boolean(id);

    useEffect(() => {
        if (isEditing) {
            setCargando(true);
            fetch(`https://api.espaciopilatescl.cl/api/clientes/${id}`)
                .then(res => {
                    if (!res.ok) throw new Error('No se pudo encontrar al cliente.');
                    return res.json();
                })
                .then((data: ClienteConUsuario) => {
                    // --- CAMBIO CLAVE ---
                    // Aplanamos los datos para el formulario, tomando el email del objeto anidado
                    const formData: ClienteFormData = {
                        ...data,
                        email: data.usuario.email, 
                    };
                    if (formData.fecha_nacimiento) {
                        formData.fecha_nacimiento = formData.fecha_nacimiento.split(' ')[0];
                    }
                    setCliente(formData);
                })
                .catch(err => setError(err.message))
                .finally(() => setCargando(false));
        }
    }, [id, isEditing]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCliente(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setGuardando(true);
        setError(null);

        const url = isEditing
            ? `https://api.espaciopilatescl.cl/api/clientes/${id}`
            : 'https://api.espaciopilatescl.cl/api/clientes';
        
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(cliente)
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Ocurrió un error al guardar los datos.';
                throw new Error(errorMessage);
            }
            navigate('/clientes');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) return <div className="p-8 text-center">Cargando datos del cliente...</div>;

    // --- MEJORA DE ESTILO ---
    // Se ha añadido la clase 'input-style' para unificar y mejorar el contraste de los campos
    const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-purple-500 focus:border-purple-500";

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {isEditing ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}
            </h1>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input type="text" name="nombre" id="nombre" value={cliente.nombre} onChange={handleInputChange} required className={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">Apellido</label>
                        <input type="text" name="apellido" id="apellido" value={cliente.apellido} onChange={handleInputChange} required className={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="rut" className="block text-sm font-medium text-gray-700">RUT</label>
                        <input type="text" name="rut" id="rut" value={cliente.rut || ''} onChange={handleInputChange} className={inputStyle} placeholder="12345678-9" />
                    </div>
                    <div>
                        <label htmlFor="genero" className="block text-sm font-medium text-gray-700">Género</label>
                        <select name="genero" id="genero" value={cliente.genero || ''} onChange={handleInputChange} className={inputStyle}>
                            <option value="">Seleccionar...</option>
                            <option value="Femenino">Femenino</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" id="email" value={cliente.email} onChange={handleInputChange} required className={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono</label>
                        <input type="text" name="telefono" id="telefono" value={cliente.telefono || ''} onChange={handleInputChange} className={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                        <input type="date" name="fecha_nacimiento" id="fecha_nacimiento" value={cliente.fecha_nacimiento || ''} onChange={handleInputChange} className={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">Dirección</label>
                        <input type="text" name="direccion" id="direccion" value={cliente.direccion || ''} onChange={handleInputChange} className={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="comuna" className="block text-sm font-medium text-gray-700">Comuna</label>
                        <input type="text" name="comuna" id="comuna" value={cliente.comuna || ''} onChange={handleInputChange} className={inputStyle} />
                    </div>
                </div>

                {error && (
                    <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={() => navigate('/clientes')} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={guardando} className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300">
                        {guardando ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClienteForm;
