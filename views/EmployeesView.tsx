
import React, { useState } from 'react';
import { IEmployee, IBranch } from '../types';
import { initialEmployees, initialBranches } from '../data/mockData';
import { Plus, Edit, ImageIcon } from '../components/Icons';

const EmployeeForm: React.FC<{ employee: IEmployee | null; onBack: () => void; onSave: (data: IEmployee) => void }> = ({ employee, onBack, onSave }) => {
    const [formData, setFormData] = useState<Omit<IEmployee, 'id'> & { id?: number }>(
        employee || { name: '', lastName1: '', lastName2: '', rut: '', birthDate: '', gender: 'Femenino', phone: '', email: '', company: 'Espacio Pilates', role: 'Colaborador', code: '', profile: 'Profesor', status: 'Habilitado', branches: [], address: '' }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleBranchChange = (branchName: string) => {
        setFormData(prev => ({
            ...prev,
            branches: prev.branches.includes(branchName)
                ? prev.branches.filter(b => b !== branchName)
                : [...prev.branches, branchName]
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: formData.id || Date.now() } as IEmployee);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{employee ? 'Editar Empleado' : 'Crear Empleado'}</h2>
                <div>
                    <button type="button" onClick={onBack} className="text-gray-600 bg-gray-200 py-2 px-4 rounded-lg mr-2 hover:bg-gray-300 transition-colors">Cancelar</button>
                    <button type="submit" className="text-white bg-purple-600 font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">Guardar</button>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow"><h3 className="font-bold mb-4 text-gray-700">Imagen</h3><div className="w-full h-40 border-2 border-dashed rounded-lg flex flex-col justify-center items-center text-gray-400 bg-gray-50 hover:bg-gray-100 cursor-pointer"><ImageIcon size={48} /><p className="text-sm mt-2">Agregar foto referencial</p></div></div>
                    <div className="bg-white p-6 rounded-lg shadow"><h3 className="font-bold mb-4 text-gray-700">Estado</h3><select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"><option>Habilitado</option><option>Deshabilitado</option></select></div>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow"><h3 className="font-bold mb-4 text-gray-700">Datos personales</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre" className="p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500" /><input name="lastName1" value={formData.lastName1} onChange={handleChange} placeholder="Apellido Paterno" className="p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500" /><input name="lastName2" value={formData.lastName2} onChange={handleChange} placeholder="Apellido Materno" className="p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500" /><input name="rut" value={formData.rut} onChange={handleChange} placeholder="RUT" className="p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500" /><input name="birthDate" value={formData.birthDate} onChange={handleChange} type="date" placeholder="Fecha de Nacimiento" className="p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500" /><select name="gender" value={formData.gender} onChange={handleChange} className="p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"><option value="">Género</option><option>Femenino</option><option>Masculino</option><option>Otro</option></select></div></div>
                    <div className="bg-white p-6 rounded-lg shadow"><h3 className="font-bold mb-4 text-gray-700">Información de contacto</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input name="phone" value={formData.phone} onChange={handleChange} placeholder="Teléfono" className="p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500" /><input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Email" className="p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500" /></div></div>
                    <div className="bg-white p-6 rounded-lg shadow"><h3 className="font-bold mb-4 text-gray-700">Datos empleado</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input name="company" value={formData.company} onChange={handleChange} placeholder="Empresa" className="p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500" /><input name="role" value={formData.role} onChange={handleChange} placeholder="Cargo" className="p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500" /><input name="code" value={formData.code} onChange={handleChange} placeholder="Código de Empleado" className="p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500" /><input name="profile" value={formData.profile} onChange={handleChange} placeholder="Perfil" className="p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500" /></div></div>
                    <div className="bg-white p-6 rounded-lg shadow"><h3 className="font-bold mb-4 text-gray-700">Sucursales</h3><div className="flex flex-wrap gap-2">{initialBranches.map(branch => (<button key={branch.id} type="button" onClick={() => handleBranchChange(branch.name)} className={`py-1 px-3 rounded-full text-sm font-semibold transition-colors ${formData.branches.includes(branch.name) ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{branch.name}</button>))}</div></div>
                </div>
            </div>
        </form>
    );
};

const EmployeesView: React.FC = () => {
    const [view, setView] = useState('list');
    const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(null);

    const handleSelectEmployee = (employee: IEmployee) => { setSelectedEmployee(employee); setView('form'); };
    const handleCreateNew = () => { setSelectedEmployee(null); setView('form'); };
    const handleBackToList = () => { setView('list'); setSelectedEmployee(null); };
    const handleSave = (employeeData: IEmployee) => {
        console.log("Guardando empleado:", employeeData);
        handleBackToList();
    };

    if (view === 'form') {
        return <EmployeeForm employee={selectedEmployee} onBack={handleBackToList} onSave={handleSave} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Empleados</h2>
                <button onClick={handleCreateNew} className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 flex items-center transition-colors">
                    <Plus size={20} className="mr-2" />Crear Empleado
                </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</th>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {initialEmployees.map(emp => (
                            <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-sm font-medium text-gray-900">{emp.name} {emp.lastName1}</td>
                                <td className="p-4 text-sm text-gray-500">{emp.code}</td>
                                <td className="p-4 text-sm text-gray-500">{emp.profile}</td>
                                <td className="p-4">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.status === 'Habilitado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{emp.status}</span>
                                </td>
                                <td className="p-4 text-sm font-medium">
                                    <button onClick={() => handleSelectEmployee(emp)} className="text-purple-600 hover:text-purple-900 flex items-center transition-colors">
                                        <Edit size={16} className="mr-1" /> Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeesView;
