import { api } from './client';
import { mapAlumna, mapClase, mapPlan, mapPago, mapReserva } from './adapters';
import type { Alumna, Clase, Plan, Pago, Reserva } from '../types/alumna';

const DEBUG = import.meta.env.VITE_DEBUG_API === '1';

async function tryGet<T>(
  paths: string[],
  mapper?: (x: any) => any,
): Promise<T> {
  let sawAuthError = false;
  let saw404Only = true;
  let lastErr: any = null;

  for (const p of paths) {
    try {
      if (DEBUG) console.debug('[API try]', p);
      const { data } = await api.get(p);
      if (!mapper) return data as T;
      return (Array.isArray(data) ? data.map(mapper) : mapper(data)) as T;
    } catch (e: any) {
      lastErr = e;
      const s = e?.response?.status;
      if (DEBUG) console.debug('[API fail]', p, s ?? e?.message);
      if (s === 401 || s === 403) {
        sawAuthError = true;
        continue;
      }
      if (s === 404) {
        continue;
      }
      saw404Only = false;
      throw e; // errores reales (500, 0, etc.) => superficie
    }
  }

  if (sawAuthError) {
    if (DEBUG) console.warn('[API] Endpoint protegido, devolviendo vacío.');
    // devolvemos vacío para no romper la UI
    return [] as unknown as T;
  }
  if (saw404Only) {
    if (DEBUG) console.warn('[API] Ninguna ruta macheó (404). Devuelvo vacío.');
    return [] as unknown as T;
  }
  throw lastErr ?? new Error('Fallo desconocido');
}

// PERFIL
export function getPerfil(id: string | number): Promise<Alumna> {
  return tryGet<Alumna>(
    [
      '/clientes/' + id,
      '/alumnas/' + id,
      '/clientes?id=' + id, // por si viene en formato colección
    ],
    mapAlumna,
  );
}

// CLASES
export function getClases(id: string | number): Promise<Clase[]> {
  return tryGet<Clase[]>(
    [
      '/clientes/' + id + '/clases',
      '/clases?cliente_id=' + id,
      '/clases?cliente=' + id,
      '/v/clases?cliente_id=' + id,
      '/actividades?cliente_id=' + id,
    ],
    mapClase,
  );
}

// RESERVAS
export async function getReservas(id: string | number): Promise<Reserva[]> {
  const paths = [
    `/reservas?cliente_id=${id}`, // PRIORIDAD 1 (según tu BD)
    `/clientes/${id}/reservas`, // Alternativa RESTful
    `/v/reservas?cliente_id=${id}`, // Alternativa con vista
    `/actividades?cliente_id=${id}`, // Fallback último
  ];

  for (const p of paths) {
    try {
      const { data } = await api.get(p);
      const arr = Array.isArray(data) ? data : [];
      return arr.map(mapReserva);
    } catch (e: any) {
      const s = e?.response?.status;
      // si es 404/401/403 intentamos la siguiente; si es otro error -> seguimos probando
      if (s && [404, 401, 403].includes(s)) continue;
    }
  }
  // si ninguna ruta sirvió, devuelve vacío (no rompemos la UI)
  return [];
}

// PLANES
export function getPlanes(id: string | number): Promise<Plan[]> {
  return tryGet<Plan[]>(
    [
      '/clientes/' + id + '/planes',
      '/v/planes?cliente_id=' + id,
      '/planes?cliente_id=' + id,
    ],
    mapPlan,
  );
}

// PAGOS
export function getPagos(id: string | number): Promise<Pago[]> {
  return tryGet<Pago[]>(
    [
      '/clientes/' + id + '/pagos',
      '/v/pagos?cliente_id=' + id,
      '/pagos?cliente_id=' + id,
    ],
    mapPago,
  );
}
