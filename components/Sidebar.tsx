
import React from 'react';
import { ViewType } from '../types';
import { Calendar, Users, Building, User, Star, CreditCard } from './Icons';

interface SidebarProps {
    currentView: ViewType;
    setCurrentView: (view: ViewType) => void;
}

const menuItems = [
    { id: 'Calendario', label: 'Calendario', icon: Calendar, group: 'Agenda' },
    { id: 'Sucursales', label: 'Sucursales', icon: Building, group: 'Gestión' },
    { id: 'Empleados', label: 'Empleados', icon: User, group: 'Gestión' },
    { id: 'Clientes', label: 'Clientes', icon: Users, group: 'Gestión' },
    { id: 'Calificacion', label: 'Calificación', icon: Star, group: 'Configuración' },
    { id: 'Pagos', label: 'Métodos de Pago', icon: CreditCard, group: 'Configuración' },
];

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
    const groupedItems = menuItems.reduce((acc, item) => {
        acc[item.group] = [...(acc[item.group] || []), item];
        return acc;
    }, {} as Record<string, typeof menuItems>);

    return (
        <aside className="w-64 flex-shrink-0 bg-white p-6 hidden md:flex flex-col shadow-lg z-10">
            <h1 className="text-2xl font-bold text-purple-600 mb-8">Agenda Pilates</h1>
            <nav className="flex-1">
                {Object.entries(groupedItems).map(([group, items]) => (
                    <div key={group} className="mb-4">
                        <h2 className="pt-4 pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">{group}</h2>
                        {items.map(item => (
                            <a
                                key={item.id}
                                href="#"
                                onClick={(e) => { e.preventDefault(); setCurrentView(item.id as ViewType); }}
                                className={`flex items-center p-2 rounded-lg transition-colors duration-200 ${currentView === item.id ? 'bg-purple-100 text-purple-600 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="ml-3">{item.label}</span>
                            </a>
                        ))}
                    </div>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
