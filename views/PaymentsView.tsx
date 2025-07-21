
import React, { useState } from 'react';
import { IPaymentMethod } from '../types';
import { initialPaymentMethods } from '../data/mockData';
import { Plus, Edit } from '../components/Icons';

const PaymentMethodForm: React.FC<{ method: IPaymentMethod | null; onBack: () => void; onSave: (data: IPaymentMethod) => void }> = ({ method, onBack, onSave }) => {
    const [formData, setFormData] = useState<Omit<IPaymentMethod, 'id'> & { id?: number }>(
        method || { name: '', description: '', status: 'Habilitado' }
    );
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: formData.id || Date.now() } as IPaymentMethod);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">{method ? 'Editar Método de Pago' : 'Crear Método de Pago'}</h2>
                <div>
                    <button type="button" onClick={onBack} className="text-gray-600 bg-gray-200 py-2 px-4 rounded-lg mr-2 hover:bg-gray-300 transition-colors">Cancelar</button>
                    <button type="submit" className="text-white bg-purple-600 font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">Guardar</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Tarjeta de Crédito" className="w-full p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <input name="description" value={formData.description} onChange={handleChange} placeholder="Descripción breve" className="w-full p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded-md bg-white focus:ring-purple-500 focus:border-purple-500">
                        <option>Habilitado</option>
                        <option>Deshabilitado</option>
                    </select>
                </div>
            </div>
        </form>
    );
};

const PaymentsView: React.FC = () => {
    const [view, setView] = useState('list');
    const [selectedMethod, setSelectedMethod] = useState<IPaymentMethod | null>(null);

    const handleSelect = (metodo: IPaymentMethod) => { setSelectedMethod(metodo); setView('form'); };
    const handleCreateNew = () => { setSelectedMethod(null); setView('form'); };
    const handleBackToList = () => { setView('list'); setSelectedMethod(null); };
    const handleSave = (data: IPaymentMethod) => {
        console.log("Guardando método de pago:", data);
        handleBackToList();
    };

    if (view === 'form') {
        return <PaymentMethodForm method={selectedMethod} onBack={handleBackToList} onSave={handleSave} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Métodos de Pago</h2>
                <button onClick={handleCreateNew} className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 flex items-center transition-colors">
                    <Plus size={20} className="mr-2" />Crear Método
                </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {initialPaymentMethods.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-sm font-medium text-gray-900">{item.name}</td>
                                <td className="p-4 text-sm text-gray-500">{item.description}</td>
                                <td className="p-4">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Habilitado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item.status}</span>
                                </td>
                                <td className="p-4 text-sm font-medium">
                                    <button onClick={() => handleSelect(item)} className="text-purple-600 hover:text-purple-900 flex items-center transition-colors">
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

export default PaymentsView;
