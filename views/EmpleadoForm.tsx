import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RiDeleteBin6Line, RiUploadCloud2Line, RiFileTextLine, RiInformationLine } from 'react-icons/ri';

const API_BASE_URL = 'https://api.espaciopilatescl.cl/api';

// --- Interfaces para los datos que manejaremos ---
interface Sucursal {
    id: number;
    nombre: string;
}

interface Certificado {
    id: number;
    nombre_documento: string;
    url_documento: string;
}

// Interfaz para los datos del formulario (sin certificados, se manejan aparte)
interface EmpleadoFormState {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    email: string;
    rut: string;
    fecha_nacimiento: string;
    genero: string;
    telefono: string;
    direccion_completa: string;
    cargo: string;
    codigo_empleado: string;
    role: string;
    habilitado: number;
    sucursales: number[];
}

const EmpleadoForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    // Estado para el formulario principal
    const [empleado, setEmpleado] = useState<EmpleadoFormState>({
        nombre: '', apellido_paterno: '', apellido_materno: '', email: '',
        rut: '', fecha_nacimiento: '', genero: '', telefono: '',
        direccion_completa: '', cargo: '', codigo_empleado: '',
        role: 'empleado', habilitado: 1, sucursales: [],
    });

    // Estados separados para la gestión de certificados
    const [certificados, setCertificados] = useState<Certificado[]>([]);
    const [sucursalesDisponibles, setSucursalesDisponibles] = useState<Sucursal[]>([]);
    const [nombreNuevoCertificado, setNombreNuevoCertificado] = useState('');
    const [archivoNuevoCertificado, setArchivoNuevoCertificado] = useState<File | null>(null);
    
    // Estados de UI
    const [cargando, setCargando] = useState<boolean>(true);
    const [guardando, setGuardando] = useState<boolean>(false);
    const [subiendo, setSubiendo] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notificacion, setNotificacion] = useState<string | null>(null);

    // --- LÓGICA DE CARGA DE DATOS CORREGIDA ---
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Siempre cargamos las sucursales
                const sucursalesRes = await fetch(`${API_BASE_URL}/sucursales`);
                if (!sucursalesRes.ok) throw new Error('No se pudieron cargar las sucursales.');
                setSucursalesDisponibles(await sucursalesRes.json());

                // Si estamos editando, cargamos los datos del empleado
                if (isEditing && id) {
                    const empleadoRes = await fetch(`${API_BASE_URL}/empleados/${id}`);
                    if (!empleadoRes.ok) throw new Error('No se pudo encontrar al empleado.');
                    const empleadoData = await empleadoRes.json();
                    
                    // Seteamos los datos del formulario principal
                    setEmpleado({
                        ...empleadoData,
                        email: empleadoData.usuario.email,
                        sucursales: empleadoData.sucursales.map((s: Sucursal) => s.id),
                    });
                    // Seteamos los certificados en su estado aparte
                    setCertificados(empleadoData.certificados || []);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        };
        fetchInitialData();
    }, [id, isEditing]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEmpleado(prev => ({ ...prev, [name]: value }));
    };

    const handleSucursalChange = (sucursalId: number) => {
        setEmpleado(prev => {
            const sucursalesActuales = prev.sucursales;
            return {
                ...prev,
                sucursales: sucursalesActuales.includes(sucursalId)
                    ? sucursalesActuales.filter(id => id !== sucursalId)
                    : [...sucursalesActuales, sucursalId],
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setGuardando(true);
        setError(null);

        const url = isEditing ? `${API_BASE_URL}/empleados/${id}` : `${API_BASE_URL}/empleados`;
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

    const handleCertificadoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!archivoNuevoCertificado || !nombreNuevoCertificado.trim() || !id) {
            setError("Por favor, complete el nombre y seleccione un archivo.");
            return;
        }
        setSubiendo(true);
        setError(null);
        setNotificacion(null);

        const formData = new FormData();
        formData.append('nombre_documento', nombreNuevoCertificado);
        formData.append('documento', archivoNuevoCertificado);

        try {
            const response = await fetch(`${API_BASE_URL}/empleados/${id}/certificados`, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al subir el archivo.');
            }
            
            setNotificacion("Certificado subido con éxito.");
            setNombreNuevoCertificado('');
            setArchivoNuevoCertificado(null);
            // Recargamos solo la lista de certificados
            const certsRes = await fetch(`${API_BASE_URL}/empleados/${id}/certificados`);
            setCertificados(await certsRes.json());

        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubiendo(false);
        }
    };

    const handleCertificadoDelete = async (certificadoId: number) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este certificado?")) return;
        
        setError(null);
        setNotificacion(null);

        try {
            const response = await fetch(`${API_BASE_URL}/certificados/${certificadoId}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar el certificado.');
            }
            
            setNotificacion("Certificado eliminado con éxito.");
            setCertificados(prev => prev.filter(c => c.id !== certificadoId));

        } catch (err: any) {
            setError(err.message);
        }
    };

    if (cargando) return <div className="p-8 text-center">Cargando...</div>;

    const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-purple-500 focus:border-purple-500";

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{isEditing ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}</h1>
            
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md mb-8">
                {/* ... (código del formulario principal sin cambios) ... */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={() => navigate('/empleados')} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button type="submit" disabled={guardando} className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-300">
                        {guardando ? 'Guardando...' : 'Guardar Empleado'}
                    </button>
                </div>
            </form>

            {/* --- SECCIÓN DE CERTIFICADOS MEJORADA --- */}
            <div className="bg-white p-8 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Gestión de Certificados</h2>
                
                {!isEditing ? (
                    <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-4 rounded-md flex items-center">
                        <RiInformationLine className="h-6 w-6 mr-3"/>
                        <p>Primero debe guardar el empleado para poder añadirle certificados.</p>
                    </div>
                ) : (
                    <>
                        {/* Lista de certificados existentes */}
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-700 mb-2">Documentos Cargados</h3>
                            {certificados.length > 0 ? (
                                <ul className="space-y-2">
                                    {certificados.map(cert => (
                                        <li key={cert.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                                            <a href={`https://api.espaciopilatescl.cl${cert.url_documento}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                                                <RiFileTextLine className="mr-2" />
                                                {cert.nombre_documento}
                                            </a>
                                            <button onClick={() => handleCertificadoDelete(cert.id)} className="text-red-500 hover:text-red-700">
                                                <RiDeleteBin6Line size={20} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 italic">No hay certificados cargados para este empleado.</p>
                            )}
                        </div>

                        {/* Formulario para subir nuevo certificado */}
                        <form onSubmit={handleCertificadoSubmit}>
                            <h3 className="text-lg font-medium text-gray-700 mb-2">Subir Nuevo Documento</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <input
                                    type="text"
                                    placeholder="Nombre del certificado"
                                    value={nombreNuevoCertificado}
                                    onChange={(e) => setNombreNuevoCertificado(e.target.value)}
                                    required
                                    className={inputStyle}
                                />
                                <input
                                    type="file"
                                    onChange={(e) => setArchivoNuevoCertificado(e.target.files ? e.target.files[0] : null)}
                                    required
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                />
                            </div>
                            <div className="flex justify-end mt-4">
                                <button type="submit" disabled={subiendo} className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                                    <RiUploadCloud2Line />
                                    {subiendo ? 'Subiendo...' : 'Subir Certificado'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
                 {error && <div className="mt-6 text-red-600"><strong>Error:</strong> {error}</div>}
                 {notificacion && <div className="mt-4 text-green-600">{notificacion}</div>}
            </div>
        </div>
    );
};

export default EmpleadoForm;
