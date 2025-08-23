import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';

// Componentes de Layout
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Vistas (Páginas) de la aplicación
import CalendarView from './views/CalendarView';
import Clientes from './views/Clientes';
import ClienteForm from './views/ClienteForm';
import SucursalesView from './views/SucursalesView';
import SucursalForm from './views/SucursalForm';
import EmpleadosView from './views/EmpleadosView';
import EmpleadoForm from './views/EmpleadoForm';
import PaymentsView from './views/PaymentsView';
import PagoForm from './views/PagoForm';
import RatingsView from './views/RatingsView';
import ClaseForm from './views/ClaseForm';
import PlanesView from './views/PlanesView';
import PlanForm from './views/PlanForm';
import ClienteDetalle from './views/ClienteDetalle';
import AsignarPlan from './views/AsignarPlan';
// --- IMPORTACIONES NUEVAS ---
import ServiciosView from './views/ServiciosView';
import ServicioForm from './views/ServicioForm';

// 👇 NUEVO: carga diferida del dashboard de Alumna (ruta y carpeta nuevas)
const AlumnaDashboard = lazy(() => import('./views/alumna/AlumnaDashboard'));

// --- Componente de Layout Principal ---
const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Todas las rutas son públicas y están dentro del Layout --- */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/calendario" replace />} />
          <Route path="calendario" element={<CalendarView />} />

          {/* --- RUTA DE REDIRECCIÓN AÑADIDA --- */}
          <Route path="calendar" element={<Navigate to="/calendario" replace />} />

          {/* Módulo de Clientes */}
          <Route path="clientes" element={<Clientes />} />
          <Route path="clientes/nuevo" element={<ClienteForm />} />
          <Route path="clientes/editar/:id" element={<ClienteForm />} />
          <Route path="clientes/detalle/:id" element={<ClienteDetalle />} />
          <Route path="clientes/:id/asignar-plan" element={<AsignarPlan />} />

          {/* Módulo de Sucursales */}
          <Route path="sucursales" element={<SucursalesView />} />
          <Route path="sucursales/nuevo" element={<SucursalForm />} />
          <Route path="sucursales/editar/:id" element={<SucursalForm />} />

          {/* Módulo de Empleados */}
          <Route path="empleados" element={<EmpleadosView />} />
          <Route path="empleados/nuevo" element={<EmpleadoForm />} />
          <Route path="empleados/editar/:id" element={<EmpleadoForm />} />

          {/* Módulo de Pagos */}
          <Route path="pagos" element={<PaymentsView />} />
          <Route path="pagos/nuevo" element={<PagoForm />} />
          <Route path="pagos/editar/:id" element={<PagoForm />} />

          {/* Módulo de Calificación */}
          <Route path="calificacion" element={<RatingsView />} />

          {/* Módulo de Clases */}
          <Route path="clases/nueva" element={<ClaseForm />} />
          <Route path="clases/editar/:id" element={<ClaseForm />} />

          {/* Módulo de Planes */}
          <Route path="planes" element={<PlanesView />} />
          <Route path="planes/nuevo" element={<PlanForm />} />
          <Route path="planes/editar/:id" element={<PlanForm />} />

          {/* --- RUTAS NUEVAS PARA SERVICIOS --- */}
          <Route path="servicios" element={<ServiciosView />} />
          <Route path="servicios/nuevo" element={<ServicioForm />} />
          <Route path="servicios/editar/:id" element={<ServicioForm />} />

          {/* --- RUTA NUEVA: DASHBOARD DE ALUMNA (carga diferida) --- */}
          <Route
            path="alumna/:id"
            element={
              <Suspense fallback={<div className="p-6 text-sm text-gray-500">Cargando alumna…</div>}>
                <AlumnaDashboard />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;