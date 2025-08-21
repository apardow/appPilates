import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Calendar, Users, Building, User, Star, CreditCard } from './Icons'; // Se mantiene tu import original

// --- Icono para Planes (existente) ---
const ClipboardList: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

// --- NUEVO ICONO PARA SERVICIOS (siguiendo tu estilo) ---
const Bookmark: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const menuItems = [
  { path: '/calendario', label: 'Calendario', icon: Calendar, group: 'Agenda' },
  { path: '/sucursales', label: 'Sucursales', icon: Building, group: 'Gestión' },
  { path: '/empleados', label: 'Empleados', icon: User, group: 'Gestión' },
  // --- CAMBIO DE TEXTO REALIZADO AQUÍ ---
  { path: '/clientes', label: 'Alumnas', icon: Users, group: 'Gestión' },
  { path: '/planes', label: 'Planes', icon: ClipboardList, group: 'Configuración' },
  { path: '/servicios', label: 'Servicios', icon: Bookmark, group: 'Configuración' },
  { path: '/calificacion', label: 'Calificación', icon: Star, group: 'Configuración' },
  { path: '/pagos', label: 'Métodos de Pago', icon: CreditCard, group: 'Configuración' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [alumnaId, setAlumnaId] = useState<string>('');

  const groupedItems = menuItems.reduce((acc, item) => {
    acc[item.group] = [...(acc[item.group] || []), item];
    return acc;
  }, {} as Record<string, typeof menuItems>);

  const goToAlumna = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Number(alumnaId);
    if (Number.isFinite(id) && id > 0) {
      navigate(`/alumna/${id}`);
      // Opcional: limpiar input tras navegar
      // setAlumnaId('');
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-white p-6 hidden md:flex flex-col shadow-lg z-10">
      <h1 className="text-2xl font-bold text-purple-600 mb-8">Agenda Pilates</h1>

      <nav className="flex-1">
        {Object.entries(groupedItems).map(([group, items]) => (
          <div key={group} className="mb-4">
            <h2 className="pt-4 pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">{group}</h2>
            {items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-purple-100 text-purple-600 font-bold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="ml-3">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}

        {/* ===== Acceso rápido al Dashboard de Alumna ===== */}
        <div className="mt-6">
          <h2 className="pt-4 pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">Acceso rápido</h2>
          <form onSubmit={goToAlumna} className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              required
              value={alumnaId}
              onChange={(e) => setAlumnaId(e.target.value)}
              placeholder="ID de alumna"
              className="w-28 border rounded px-2 py-1 text-sm"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-sm rounded bg-purple-600 text-white hover:bg-purple-700"
              title="Ir al Dashboard de Alumna"
            >
              Ir
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-1">Navega a <code>/alumna/:id</code></p>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
