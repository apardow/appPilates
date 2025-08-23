export type ID = string | number;

// CLASES (tabla `clases`)
export interface Clase {
  id: ID;
  servicio_id: ID;
  fecha: string; // date
  hora_inicio: string; // time
  hora_fin: string; // time
  cupos_disponibles: number;
  estado: 'programada' | 'cancelada' | 'completada';
  servicio_nombre?: string; // opcional (si el endpoint lo trae con JOIN)
}

// RESERVAS (tabla `reservas`)
export type ReservaEstado =
  | 'activa'
  | 'cancelada_a_tiempo'
  | 'cancelada_tarde'
  | 'asistida'
  | 'ausente';

export interface Reserva {
  id: ID;
  clase_id: ID;
  cliente_id: ID;
  cliente_plan_id: ID;
  estado: ReservaEstado;
  cancelada_en: string | null; // timestamp
}

// PLANES (vista v_planes_alumna)
export interface Plan {
  cliente_plan_id: ID;
  cliente_id: ID;
  plan_nombre: string;
  cantidad_clases: number;
  clases_restantes: number;
  clases_consumidas: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'vigente' | 'consumido' | 'caducado' | 'eliminado' | 'activo';
}

// PAGOS (vista v_pagos_alumna)
export interface Pago {
  pago_id: ID;
  cliente_id: ID;
  monto: number;
  metodo_pago: string;
  estado: string;
  referencia_externa?: string | null;
  pagado_en: string; // timestamp
}

// PERFIL (tabla `clientes`, email desde `usuarios` vía backend)
export interface Alumna {
  id: ID;
  user_id: ID;
  nombre: string;
  apellido: string;
  email?: string; // preferible que el backend lo incluya
  telefono?: string | null;
  foto_url?: string | null;
  activo: 0 | 1 | 2 | 3; // según tu uso actual
}
