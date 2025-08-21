// Servicio centralizado Alumna API
import type {
  PlanAlumna, ActividadAlumna, PagoAlumna, DocumentoAlumna, AlumnaResumen
} from "../types/alumna";

const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE ?? "https://api.espaciopilatescl.cl/api";

type HttpError = Error & { status?: number };

async function request<T>(path: string, init?: RequestInit, timeoutMs = 15000): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      ...init,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err: HttpError = new Error(text || `${res.status} ${res.statusText}`);
      err.status = res.status;
      throw err;
    }
    const json = (await res.json()) as { data: unknown };
    return json.data as T;
  } finally {
    clearTimeout(id);
  }
}

/* Helpers */
function qs(params: Record<string, string | number | undefined | null>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/* Endpoints */
export function getPlanes(clienteId: number, params?: {
  estado?: "vigente" | "consumido" | "caducado" | "eliminado";
  limit?: number;
}) {
  const query = qs({ estado: params?.estado, limit: params?.limit });
  return request<PlanAlumna[]>(`/alumnas/${clienteId}/planes${query}`);
}

export function getActividades(clienteId: number, params?: {
  desde?: string; hasta?: string;
  estado?: "asistida" | "cancelada_a_tiempo" | "cancelada_tarde" | "activa" | "ausente";
  limit?: number;
}) {
  const query = qs({ desde: params?.desde, hasta: params?.hasta, estado: params?.estado, limit: params?.limit });
  return request<ActividadAlumna[]>(`/alumnas/${clienteId}/actividades${query}`);
}

export function getPagos(clienteId: number, params?: {
  estado?: "pagado" | "pendiente" | "reembolsado" | "anulado";
  metodo?: string; limit?: number;
}) {
  const query = qs({ estado: params?.estado, metodo: params?.metodo, limit: params?.limit });
  return request<PagoAlumna[]>(`/alumnas/${clienteId}/pagos${query}`);
}

export function getDocumentos(clienteId: number, params?: { tipo?: string; limit?: number }) {
  const query = qs({ tipo: params?.tipo, limit: params?.limit });
  return request<DocumentoAlumna[]>(`/alumnas/${clienteId}/documentos${query}`);
}

/* Resumen (badge “Planes Activos”) */
export async function getResumen(clienteId: number): Promise<AlumnaResumen> {
  try {
    return await request<AlumnaResumen>(`/alumnas/${clienteId}/resumen`);
  } catch {
    // Fallback: contar vigentes desde getPlanes
    const planes = await getPlanes(clienteId);
    const activos = planes.filter(p => p.estado === "vigente" && (p.clases_restantes ?? 0) > 0).length;
    return { activos };
  }
}

// SUBIR documento (multipart/form-data)
export async function uploadClienteDocumento(
  clienteId: number,
  payload: { nombre_documento: string; archivo: File; tipo?: string; emitido_el?: string; vence_el?: string }
) {
  const form = new FormData();
  form.set("nombre_documento", payload.nombre_documento);
  form.set("documento", payload.archivo);
  if (payload.tipo) form.set("tipo", payload.tipo);
  if (payload.emitido_el) form.set("emitido_el", payload.emitido_el);
  if (payload.vence_el) form.set("vence_el", payload.vence_el);

  const res = await fetch(`${API_BASE}/alumnas/${clienteId}/documentos`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return json as { data: DocumentoAlumna };
}

// ELIMINAR documento
export async function deleteClienteDocumento(documentoId: number) {
  const res = await fetch(`${API_BASE}/alumna-documentos/${documentoId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return true;
}