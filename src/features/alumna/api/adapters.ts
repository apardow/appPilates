import type { Alumna, Clase, Reserva, Plan, Pago } from "../types/alumna";

export function mapClase(raw: any): Clase {
  return {
    id: raw.id,
    servicio_id: raw.servicio_id,
    fecha: raw.fecha,
    hora_inicio: raw.hora_inicio,
    hora_fin: raw.hora_fin,
    cupos_disponibles: Number(raw.cupos_disponibles ?? 0),
    estado: raw.estado,
    servicio_nombre: raw.servicio?.nombre ?? raw.servicio_nombre,
  };
}

export function mapReserva(raw: any): Reserva {
  return {
    id: raw.id ?? raw.reserva_id,
    clase_id: raw.clase_id,
    cliente_id: raw.cliente_id,
    cliente_plan_id: raw.cliente_plan_id,
    estado: raw.estado,
    cancelada_en: raw.cancelada_en ?? null,
  };
}

export function mapPlan(raw: any): Plan {
  return {
    cliente_plan_id: raw.cliente_plan_id,
    cliente_id: raw.cliente_id,
    plan_nombre: raw.plan_nombre,
    cantidad_clases: Number(raw.cantidad_clases ?? 0),
    clases_restantes: Number(raw.clases_restantes ?? 0),
    clases_consumidas: Number(raw.clases_consumidas ?? 0),
    fecha_inicio: raw.fecha_inicio,
    fecha_fin: raw.fecha_fin,
    estado: raw.estado,
  };
}

export function mapPago(raw: any): Pago {
  return {
    pago_id: raw.pago_id,
    cliente_id: raw.cliente_id,
    monto: Number(raw.monto ?? 0),
    metodo_pago: raw.metodo_pago,
    estado: raw.estado,
    referencia_externa: raw.referencia_externa ?? null,
    pagado_en: raw.pagado_en,
  };
}

export function mapAlumna(raw: any): Alumna {
  return {
    id: raw.id,
    user_id: raw.user_id,
    nombre: raw.nombre,
    apellido: raw.apellido,
    email: raw.email,
    telefono: raw.telefono ?? null,
    foto_url: raw.foto_url ?? null,
    activo: raw.activo,
  };
}
