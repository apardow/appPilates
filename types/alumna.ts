// Tipos compartidos para el dominio "alumna"

export type PlanAlumna = {
  cliente_plan_id: number;
  cliente_id: number;
  plan_nombre: string;
  cantidad_clases: number;
  clases_restantes: number;
  clases_consumidas: number;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  estado: 'vigente' | 'consumido' | 'caducado' | 'eliminado';
  eliminado_en: string | null;
  motivo_eliminacion: string | null;
};

export type ActividadAlumna = {
  reserva_id: number;
  cliente_id: number;
  cliente_plan_id: number | null;
  fecha: string;        // YYYY-MM-DD
  hora_inicio: string;  // HH:mm:ss
  hora_fin: string;     // HH:mm:ss
  sucursal_id: number;
  estado: 'activa' | 'cancelada_a_tiempo' | 'cancelada_tarde' | 'asistida' | 'ausente';
  cancelada_en: string | null;
  min_antes: number | null;
};

export type PagoAlumna = {
  pago_id: number;
  cliente_id: number;
  monto: number;
  metodo_pago: string;
  estado: 'pagado' | 'pendiente' | 'reembolsado' | 'anulado';
  referencia_externa: string | null;
  pagado_en: string | null;
};

export type DocumentoAlumna = {
  documento_id: number;
  cliente_id: number;
  nombre_documento: string;
  url_documento: string;
  tipo: string | null;
  emitido_el: string | null;
  vence_el: string | null;
  updated_at: string | null;
};

export type AlumnaResumen = {
  activos: number;          // planes vigentes con clases disponibles (backend)
  total_vigentes?: number;  // opcional, si lo agregamos luego
};
