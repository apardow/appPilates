import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import type { LazyExoticComponent, ComponentType } from 'react';
import AlumnaLayout from '@/features/alumna/layout/AlumnaLayout';

const Clases = lazy(() => import('@/features/alumna/routes/clases'));
const Reservas = lazy(() => import('@/features/alumna/routes/reservas'));
const Planes = lazy(() => import('@/features/alumna/routes/planes'));
const Pagos = lazy(() => import('@/features/alumna/routes/pagos'));
const Perfil = lazy(() => import('@/features/alumna/routes/perfil'));

const Lazy = (C: LazyExoticComponent<ComponentType<any>>) => (
  <Suspense fallback={<div className="container">Cargando…</div>}>
    <C />
  </Suspense>
);

// Detecta si la app se sirve bajo /clientes (p.ej. en producción o enlaces viejos)
const isClientesBase =
  typeof window !== 'undefined' &&
  window.location.pathname.startsWith('/clientes');
const BASENAME = isClientesBase ? '/clientes' : '';

// Guardia para romper loops tipo /clientes/alumna/alumna/...
function LoopGuard() {
  useEffect(() => {
    const repeated = /(\/alumna){2,}/;
    if (repeated.test(window.location.pathname)) {
      window.history.replaceState(null, '', `${BASENAME}/alumna`);
    }
  }, []);
  return null;
}

function RootError() {
  return (
    <div className="container">
      <h2 className="text-xl font-semibold mb-2">Página no encontrada</h2>
      <p className="mb-3">La ruta solicitada no existe (404).</p>
      <a href={`${BASENAME}/alumna`} className="underline">
        Ir al panel de alumna
      </a>
    </div>
  );
}

function RootShell() {
  return (
    <>
      <LoopGuard />
      <Outlet />
    </>
  );
}

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RootShell />,
      errorElement: <RootError />,
      children: [
        // raíz → /alumna
        { index: true, element: <Navigate to="/alumna" replace /> },

        // sección Alumna
        {
          path: 'alumna',
          element: <AlumnaLayout />,
          children: [
            { index: true, element: <Navigate to="/alumna/clases" replace /> },
            { path: 'clases', element: Lazy(Clases) },
            { path: 'reservas', element: Lazy(Reservas) },
            { path: 'planes', element: Lazy(Planes) },
            { path: 'pagos', element: Lazy(Pagos) },
            { path: 'perfil', element: Lazy(Perfil) },
            // desconocidas en /alumna → /alumna/clases
            { path: '*', element: <Navigate to="/alumna/clases" replace /> },
          ],
        },

        // cualquier ruta desconocida → /alumna
        { path: '*', element: <Navigate to="/alumna" replace /> },
      ],
    },
  ],
  { basename: BASENAME },
);
