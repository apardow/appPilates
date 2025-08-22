import { NavLink, Outlet } from 'react-router-dom';

const tabs = [
  { to: 'clases', label: 'Clases' },
  { to: 'reservas', label: 'Reservas' },
  { to: 'planes', label: 'Planes' },
  { to: 'pagos', label: 'Pagos' },
  { to: 'perfil', label: 'Perfil' },
];

export default function AlumnaLayout() {
  return (
    <div className="container">
      <h1 className="text-2xl font-semibold mb-4">Mi Panel</h1>
      <nav className="flex gap-2 border-b mb-4">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) => \	ab \\}
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
