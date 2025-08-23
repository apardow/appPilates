import { api } from "./client";
import { mapAlumna, mapClase, mapPlan, mapPago, mapReserva } from "./adapters";
import type { Alumna, Clase, Plan, Pago, Reserva } from "../types/alumna";

const DEBUG = import.meta.env.VITE_DEBUG_API === "1";

async function firstOk<T>(paths: string[], mapper?: (x: any) => any) {
  let lastErr: any = null;
  for (const p of paths) {
    try {
      if (DEBUG) console.debug("[API try]", p);
      const { data } = await api.get(p);
      if (!mapper) return data as T;
      return (Array.isArray(data) ? data.map(mapper) : mapper(data)) as T;
    } catch (e: any) {
      lastErr = e;
      const s = e?.response?.status;
      if (DEBUG) console.debug("[API fail]", p, s ?? e?.message);
      if (s && s !== 404) throw e; // si no es 404, es error real
    }
  }
  if (DEBUG) console.debug("[API none matched]", paths);
  throw lastErr ?? new Error("Endpoint no encontrado");
}

// PERFIL
export const getPerfil = (id: string | number): Promise<Alumna> =>
  firstOk<Alumna>(
    [
      `/clientes/${id}`,
      `/alumnas/${id}`,
      `/clientes?id=${id}`, // por si viene tipo collection
    ],
    mapAlumna
  );

// CLASES
export const getClases = (id: string | number): Promise<Clase[]> =>
  firstOk<Clase[]>(
    [
      `/clientes/${id}/clases`,
      `/clases?cliente_id=${id}`,
      `/clases?cliente=${id}`,
      `/v/clases?cliente_id=${id}`,
      `/actividades?cliente_id=${id}` // por si usan vista actividades
    ],
    mapClase
  );

// RESERVAS
export const getReservas = (id: string | number): Promise<Reserva[]> =>
  firstOk<Reserva[]>(
    [
      `/clientes/${id}/reservas`,
      `/reservas?cliente_id=${id}`,
      `/reservas?cliente=${id}`,
      `/v/reservas?cliente_id=${id}`,
      `/actividades?cliente_id=${id}` // fallback a actividades
    ],
    mapReserva
  );

// PLANES
export const getPlanes = (id: string | number): Promise<Plan[]> =>
  firstOk<Plan[]>(
    [
      `/clientes/${id}/planes`,
      `/v/planes?cliente_id=${id}`,
      `/planes?cliente_id=${id}`,
    ],
    mapPlan
  );

// PAGOS
export const getPagos = (id: string | number): Promise<Pago[]> =>
  firstOk<Pago[]>(
    [
      `/clientes/${id}/pagos`,
      `/v/pagos?cliente_id=${id}`,
      `/pagos?cliente_id=${id}`,
    ],
    mapPago
  );
