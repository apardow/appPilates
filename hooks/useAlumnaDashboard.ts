import { useEffect, useMemo, useRef, useState } from "react";
import {
  getPlanes,
  getActividades,
  getPagos,
  getDocumentos,
  getResumen,
  uploadClienteDocumento,
  deleteClienteDocumento,
} from "../data/alumnaApi";

import type {
  PlanAlumna,
  ActividadAlumna,
  PagoAlumna,
  DocumentoAlumna,
  AlumnaResumen,
} from "../types/alumna";

type LoadState = "idle" | "loading" | "success" | "error";

export interface AlumnaData {
  planes: PlanAlumna[];
  actividades: ActividadAlumna[];
  pagos: PagoAlumna[];
  documentos: DocumentoAlumna[];
  resumen: AlumnaResumen | null;
}

/* -------------------- helpers -------------------- */

// deep getter por path "a.b.c"
function getPath(o: any, path: string) {
  return path.split(".").reduce((acc: any, k: string) => (acc == null ? acc : acc[k]), o);
}
function pick<T = any>(o: any, keys: string[], fallback: T): T {
  for (const k of keys) {
    const v = getPath(o, k);
    if (v !== undefined && v !== null && v !== "") return v as T;
  }
  return fallback;
}
function toNum(x: any, def = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : def;
}

// Busca recursivamente una propiedad cuyo nombre haga match con el regex.
// Retorna el PRIMER string/number que encuentre (profundidad limitada).
function deepFindByKey(o: any, keyRegex: RegExp, depth = 5): any {
  if (!o || depth < 0) return undefined;
  if (typeof o !== "object") return undefined;

  for (const k of Object.keys(o)) {
    const v = (o as any)[k];

    if (keyRegex.test(k) && (typeof v === "string" || typeof v === "number")) {
      return v;
    }
    if (Array.isArray(v)) {
      for (const it of v) {
        const r = deepFindByKey(it, keyRegex, depth - 1);
        if (r !== undefined) return r;
      }
    } else if (typeof v === "object" && v !== null) {
      const r = deepFindByKey(v, keyRegex, depth - 1);
      if (r !== undefined) return r;
    }
  }
  return undefined;
}

// nombre automático: prueba claves comunes y, si falla, busca en profundidad.
function autoNombre(o: any, prefer: string[] = []): string | undefined {
  const direct = pick<string | undefined>(o, prefer, undefined as any);
  if (direct) return String(direct);
  const deep =
    deepFindByKey(o, /(nombre|name|t[ií]tulo|title)$/i, 5) ??
    deepFindByKey(o, /(servicio|producto|plan).*?(nombre|name)$/i, 5);
  return deep ? String(deep) : undefined;
}

/* -------------------- normalizadores -------------------- */
function normPlan(r: any): PlanAlumna {
  const id = pick(r, ["id", "planId", "uid"], "(sin-id)");
  const nombre =
    autoNombre(r, [
      "nombre",
      "planNombre",
      "plan.nombre",
      "producto.nombre",
      "servicio.nombre",
      "titulo",
      "name",
    ]) ?? `(Plan #${id})`;

  return {
    id,
    nombre,
    clasesTotales: toNum(pick(r, ["clasesTotales", "totalClases", "cupos", "clases", "total"], 0)),
    clasesUsadas: toNum(pick(r, ["clasesUsadas", "usadas", "consumidas", "clases_consumidas"], 0)),
    vencimiento: pick(r, ["vencimiento", "fechaVencimiento", "fecha_vencimiento", "expiraEl", "fechaFin", "fecha_fin"], null),
    estado: pick(r, ["estado", "status", "estado_plan"], "VIGENTE"),
  } as PlanAlumna;
}

function normActividad(r: any): ActividadAlumna {
  const id = pick(r, ["id", "actividadId", "uid"], "(sin-id)");
  const nombre =
    autoNombre(r, [
      "nombre",
      "titulo",
      "actividad",
      "servicioNombre",
      "servicio.nombre",
      "clase.servicio.nombre",
      "tipoActividad",
    ]) ?? `(Actividad #${id})`;

  return {
    id,
    nombre,
    fecha: pick(r, ["fecha", "fechaISO", "fecha_inicio", "inicio", "start", "dia"], ""),
    hora: pick(r, ["hora", "hora_inicio", "time", "start_time", "inicio_hora"], ""),
    sucursal:
      autoNombre(r, ["sucursal", "sucursalNombre", "sede", "local", "centro", "branch", "sucursal.nombre", "sede.nombre"]) ??
      pick(r, ["sucursal", "sede", "local", "branch"], ""),
    estado: pick(r, ["estado", "status"], "ACTIVA"),
  } as ActividadAlumna;
}

function normPago(r: any): PagoAlumna {
  return {
    id: pick(r, ["id", "pagoId", "uid"], "(sin-id)"),
    fecha: pick(r, ["fecha", "fechaISO", "fecha_pago"], ""),
    monto: toNum(pick(r, ["monto", "amount", "valor"], 0)),
    metodo: pick(r, ["metodo", "medio", "metodo_pago", "paymentMethod"], ""),
    nota: pick(r, ["nota", "observacion", "detalle"], ""),
  } as PagoAlumna;
}

function normDocumento(r: any): DocumentoAlumna {
  return {
    id: pick(r, ["id", "docId", "uid"], "(sin-id)"),
    nombre: autoNombre(r, ["nombre", "fileName", "titulo"]) ?? "(Documento)",
    url: pick(r, ["url", "link", "href"], undefined),
  } as DocumentoAlumna;
}

function normResumen(r: any): AlumnaResumen {
  return {
    nombre:
      autoNombre(r, ["nombre", "nombreCompleto", "cliente.nombre", "fullName", "persona.nombre"]) ??
      "",
    planesActivos: toNum(pick(r, ["planesActivos", "activos", "planes_activos"], 0)),
    clasesTomadas: toNum(pick(r, ["clasesTomadas", "clases_tomadas", "totalClasesTomadas"], 0)),
  } as AlumnaResumen;
}

/* -------------------- hook -------------------- */
export function useAlumnaDashboard(alumnaId?: string) {
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<AlumnaData>({
    planes: [],
    actividades: [],
    pagos: [],
    documentos: [],
    resumen: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const load = async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    setState("loading");
    setError(null);
    try {
      // Si tu alumnaApi NO acepta { signal }, elimina ese segundo parámetro.
      const [rp, ra, rpg, rd, rr] = await Promise.all([
        getPlanes(alumnaId, { signal }),
        getActividades(alumnaId, { signal }),
        getPagos(alumnaId, { signal }),
        getDocumentos(alumnaId, { signal }),
        getResumen(alumnaId, { signal }),
      ]);
      if (signal.aborted) return;

      const planes = Array.isArray(rp) ? rp.map(normPlan) : [];
      const actividades = Array.isArray(ra) ? ra.map(normActividad) : [];
      const pagos = Array.isArray(rpg) ? rpg.map(normPago) : [];
      const documentos = Array.isArray(rd) ? rd.map(normDocumento) : [];
      const resumen = rr ? normResumen(rr) : null;

      setData({ planes, actividades, pagos, documentos, resumen });
      setState("success");

      if (import.meta.env.DEV) {
        console.debug("[AlumnaDashboard RAW]", { rp, ra, rpg, rd, rr });
        console.debug("[AlumnaDashboard NORM]", { planes, actividades, pagos, documentos, resumen });
      }
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setError(e);
      setState("error");
    }
  };

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alumnaId]);

  const totalPagado = useMemo(
    () => data.pagos.reduce((acc, p) => acc + (p.monto ?? 0), 0),
    [data.pagos]
  );

  const actividadesFuturas = useMemo(
    () => data.actividades.filter(a => (a.fecha ? new Date(a.fecha) : new Date(0)) >= new Date()),
    [data.actividades]
  );

  return {
    state,
    error,
    data,
    totalPagado,
    actividadesFuturas,
    reload: load,
    uploadClienteDocumento: (file: File) => uploadClienteDocumento(file, alumnaId),
    deleteClienteDocumento: (docId: string) => deleteClienteDocumento(docId, alumnaId),
  };
}
