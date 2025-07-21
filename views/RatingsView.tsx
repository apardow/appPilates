
import React, { useState, useMemo } from 'react';
import { initialRatings, initialBranches } from '../data/mockData';
import StarRating from '../components/StarRating';

const RatingsView: React.FC = () => {
    const [filters, setFilters] = useState({ branch: 'all', service: 'all', monitor: 'all' });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const monitors = [...new Set(initialRatings.map(c => c.monitor))];
    const services = [...new Set(initialRatings.map(c => c.service))];
    
    const filteredRatings = useMemo(() => initialRatings.filter(c =>
        (filters.branch === 'all' || c.branch === filters.branch) &&
        (filters.service === 'all' || c.service === filters.service) &&
        (filters.monitor === 'all' || c.monitor === filters.monitor)
    ), [filters]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Calificación de Servicios</h2>
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                    <select name="branch" onChange={handleFilterChange} className="w-full p-2 border rounded-md bg-white focus:ring-purple-500 focus:border-purple-500">
                        <option value="all">Todas las Sucursales</option>
                        {initialBranches.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                    <select name="service" onChange={handleFilterChange} className="w-full p-2 border rounded-md bg-white focus:ring-purple-500 focus:border-purple-500">
                        <option value="all">Todos los Servicios</option>
                        {services.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select name="monitor" onChange={handleFilterChange} className="w-full p-2 border rounded-md bg-white focus:ring-purple-500 focus:border-purple-500">
                        <option value="all">Todos los Monitores</option>
                        {monitors.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <button className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors w-full">Filtrar</button>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full min-w-max">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calificación</th>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sucursal</th>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monitor</th>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingreso</th>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comentarios</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredRatings.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 whitespace-nowrap"><StarRating rating={item.rating} /></td>
                                <td className="p-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.service}</td>
                                <td className="p-4 whitespace-nowrap text-sm text-gray-500">{item.branch}</td>
                                <td className="p-4 whitespace-nowrap text-sm text-gray-500">{item.monitor}</td>
                                <td className="p-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                                <td className="p-4 whitespace-nowrap text-sm text-gray-500">{item.client}</td>
                                <td className="p-4 text-sm text-gray-600 max-w-xs">{item.comment}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RatingsView;
