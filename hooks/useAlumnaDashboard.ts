
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
      const [planes, actividades, pagos, documentos, resumen] = await Promise.all([
        getPlanes(alumnaId, { signal }),
        getActividades(alumnaId, { signal }),
        getPagos(alumnaId, { signal }),
        getDocumentos(alumnaId, { signal }),
        getResumen(alumnaId, { signal }),
      ]);
      if (signal.aborted) return;
      setData({ planes, actividades, pagos, documentos, resumen });
      setState("success");
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

  // Ejemplos de derivados memorizados
  const totalPagado = useMemo(
    () => data.pagos.reduce((acc, p) => acc + (p.monto ?? 0), 0),
    [data.pagos]
  );

  const actividadesFuturas = useMemo(
    () => data.actividades.filter(a => new Date(a.fecha) >= new Date()),
    [data.actividades]
  );

  return {
    state,
    error,
    data,
    totalPagado,
    actividadesFuturas,
    reload: load,
    uploadClienteDocumento,
    deleteClienteDocumento,
  };
}
