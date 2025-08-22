import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import type { LazyExoticComponent, ComponentType } from 'react';
import AlumnaLayout from '@/features/alumna/layout/AlumnaLayout';

const Clases   = lazy(() => import('@/features/alumna/routes/clases'));
const Reservas = lazy(() => import('@/features/alumna/routes/reservas'));
const Planes   = lazy(() => import('@/features/alumna/routes/planes'));
const Pagos    = lazy(() => import('@/features/alumna/routes/pagos'));
const Perfil   = lazy(() => import('@/features/alumna/routes/perfil'));

const Lazy = (C: LazyExoticComponent<ComponentType<any>>) => (
  <Suspense fallback={<div className='container'>Cargando…</div>}>
    <C />
  </Suspense>
);

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to='/alumna' replace /> },
  {
    path: '/alumna',
    element: <AlumnaLayout />,
    children: [
      { index: true, element: <Navigate to='clases' replace /> },
      { path: 'clases',   element: Lazy(Clases)   },
      { path: 'reservas', element: Lazy(Reservas) },
      { path: 'planes',   element: Lazy(Planes)   },
      { path: 'pagos',    element: Lazy(Pagos)    },
      { path: 'perfil',   element: Lazy(Perfil)   },
    ],
  },
]);
