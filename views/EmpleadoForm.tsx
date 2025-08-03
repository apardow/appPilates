import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Interfaces para los datos que manejaremos
interface Sucursal {
    id: number;
    nombre: string;
}

interface EmpleadoFormData {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    email: string; // El email vive en la tabla de usuarios
    rut: string;
    fecha_nacimiento: string;
    genero: string;
    telefono: string;
    direccion_completa: string;
    cargo: string;
    codigo_empleado: string;
    role: string; // Rol en el sistema (ej. 'empleado', 'admin')
    habilitado: number;
    sucursales: number[]; // Array con los IDs de las sucursales asignadas
}

const EmpleadoForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    // Estado para el formulario
    const [empleado, setEmpleado] = useState<EmpleadoFormData>({
        nombre: '', apellido_paterno: '', apellido_materno: '', email: '',
        rut: '', fecha_nacimiento: '', genero: '', telefono: '',
        direccion_completa: '', cargo: '', codigo_empleado: '',
        role: 'empleado', habilitado: 1, sucursales: [],
    });

    // Estado para la lista de sucursales disponibles
    const [sucursalesDisponibles, setSucursalesDisponibles] = useState<Sucursal[]>([]);
    
    // Estados de UI
    const [cargando, setCargando] = useState<boolean>(false);
    const [guardando, setGuardando] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // useEffect para cargar datos iniciales (sucursales y datos del empleado si se está editando)
    useEffect(() => {
        const fetchData = async () => {
            setCargando(true);
            try {
                // 1. Cargar la lista de todas las sucursales
                const sucursalesRes = await fetch('https://api.espaciopilatescl.cl/api/sucursales');
                if (!sucursalesRes.ok) throw new Error('No se pudieron cargar las sucursales.');
                const sucursalesData: Sucursal[] = await sucursalesRes.json();
                setSucursalesDisponibles(sucursalesData);

                // 2. Si estamos editando, cargar los datos del empleado
                if (isEditing) {
                    const empleadoRes = await fetch(`https://api.espaciopilatescl.cl/api/empleados/${id}`);
                    if (!empleadoRes.ok) throw new Error('No se pudo encontrar al empleado.');
                    const empleadoData = await empleadoRes.json();
                    
                    // Adaptamos los datos recibidos al formato del formulario
                    setEmpleado({
                        ...empleadoData,
                        email: empleadoData.usuario.email, // Tomamos el email del usuario anidado
                        sucursales: empleadoData.sucursales.map((s: Sucursal) => s.id) // Extraemos solo los IDs de las sucursales
                    });
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        };
        fetchData();
    }, [id, isEditing]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEmpleado(prev => ({ ...prev, [name]: value }));
    };

    const handleSucursalChange = (sucursalId: number) => {
        setEmpleado(prev => {
            const sucursalesActuales = prev.sucursales;
            if (sucursalesActuales.includes(sucursalId)) {
                return { ...prev, sucursales: sucursalesActuales.filter(id => id !== sucursalId) };
            } else {
                return { ...prev, sucursales: [...sucursalesActuales, sucursalId] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setGuardando(true);
        setError(null);

        const url = isEditing ? `https://api.espaciopilatescl.cl/api/empleados/${id}` : 'https://api.espaciopilatescl.cl/api/empleados';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(empleado)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ocurrió un error al guardar el empleado.');
            }
            navigate('/empleados');
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
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{isEditing ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Columna 1: Datos Personales */}
                    <div className="md:col-span-2 space-y-6">
                        <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Datos Personales</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input type="text" name="nombre" placeholder="Nombre" value={empleado.nombre} onChange={handleInputChange} required className={inputStyle} />
                            <input type="text" name="apellido_paterno" placeholder="Apellido Paterno" value={empleado.apellido_paterno} onChange={handleInputChange} required className={inputStyle} />
                            <input type="text" name="apellido_materno" placeholder="Apellido Materno" value={empleado.apellido_materno} onChange={handleInputChange} className={inputStyle} />
                            <input type="text" name="rut" placeholder="RUT" value={empleado.rut} onChange={handleInputChange} required className={inputStyle} />
                            <input type="date" name="fecha_nacimiento" value={empleado.fecha_nacimiento} onChange={handleInputChange} className={inputStyle} />
                            <select name="genero" value={empleado.genero} onChange={handleInputChange} className={inputStyle}>
                                <option value="">Género...</option>
                                <option value="Femenino">Femenino</option>
                                <option value="Masculino">Masculino</option>
                            </select>
                        </div>
                         <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 pt-4">Datos de Contacto</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input type="text" name="telefono" placeholder="Teléfono" value={empleado.telefono} onChange={handleInputChange} className={inputStyle} />
                            <input type="email" name="email" placeholder="Email" value={empleado.email} onChange={handleInputChange} required className={inputStyle} />
                            <div className="md:col-span-2">
                                <input type="text" name="direccion_completa" placeholder="Dirección Completa" value={empleado.direccion_completa} onChange={handleInputChange} className={inputStyle} />
                            </div>
                        </div>
                    </div>

                    {/* Columna 2: Datos de Empleado y Sucursales */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Datos de Empleado</h2>
                        <input type="text" name="cargo" placeholder="Cargo" value={empleado.cargo} onChange={handleInputChange} required className={inputStyle} />
                        <input type="text" name="codigo_empleado" placeholder="Código de Empleado" value={empleado.codigo_empleado} onChange={handleInputChange} className={inputStyle} />
                        <select name="role" value={empleado.role} onChange={handleInputChange} className={inputStyle}>
                            <option value="empleado">Perfil Empleado</option>
                            <option value="admin">Perfil Administrador</option>
                        </select>
                        
                        <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 pt-4">Sucursales Asignadas</h2>
                        <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md bg-gray-50">
                            {sucursalesDisponibles.map(sucursal => (
                                <label key={sucursal.id} className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={empleado.sucursales.includes(sucursal.id)}
                                        onChange={() => handleSucursalChange(sucursal.id)}
                                        className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-700">{sucursal.nombre}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {error && <div className="mt-6 text-red-600"><strong>Error:</strong> {error}</div>}
                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={() => navigate('/empleados')} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button type="submit" disabled={guardando} className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-300">
                        {guardando ? 'Guardando...' : 'Guardar Empleado'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EmpleadoForm;
