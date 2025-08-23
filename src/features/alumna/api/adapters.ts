import type { Alumna, Clase, Reserva, Plan, Pago } from '../types/alumna';

const pick = (o: any, keys: string[], d: any = undefined) => {
  for (const k of keys)
    if (o?.[k] !== undefined && o?.[k] !== null) return o[k];
  return d;
};

// ---------- CLASE ----------
export function mapClase(raw: any): Clase {
  return {
    id: pick(raw, ['id', 'clase_id', 'uuid']),
    servicio_id: pick(raw, ['servicio_id', 'service_id']),
    fecha: String(pick(raw, ['fecha', 'date', 'dia'], '')),
    hora_inicio: String(
      pick(raw, ['hora_inicio', 'inicio', 'start_time', 'hora'], ''),
    ),
    hora_fin: String(pick(raw, ['hora_fin', 'fin', 'end_time'], '')),
    cupos_disponibles: Number(
      pick(
        raw,
        ['cupos_disponibles', 'disponibles', 'quota', 'plazas_disponibles'],
        0,
      ),
    ),
    estado: pick(raw, ['estado', 'status'], 'programada'),
    servicio_nombre: pick(raw, [
      'servicio_nombre',
      'servicio?.nombre',
      'service_name',
    ]),
  } as any;
}

// ---------- RESERVA ----------

export function mapReserva(raw: any): Reserva {
  return {
    id: raw.id ?? raw.reserva_id,
    clase_id: raw.clase_id,
    cliente_id: raw.cliente_id,
    cliente_plan_id: raw.cliente_plan_id,
    estado: raw.estado, // "activa" | "cancelada_a_tiempo" | "cancelada_tarde" | ...
    asistencia_marcada: raw.asistencia_marcada ?? 0,
    cancelada_en: raw.cancelada_en ?? null,
    created_at: raw.created_at ?? undefined,
  };
}

// ---------- PLAN ----------
export function mapPlan(raw: any): Plan {
  return {
    cliente_plan_id: pick(raw, ['cliente_plan_id', 'id', 'plan_id']),
    cliente_id: pick(raw, ['cliente_id', 'client_id']),
    plan_nombre: String(pick(raw, ['plan_nombre', 'nombre', 'name'], '')),
    cantidad_clases: Number(
      pick(raw, ['cantidad_clases', 'clases_total', 'total_clases'], 0),
    ),
    clases_restantes: Number(
      pick(raw, ['clases_restantes', 'saldo', 'restantes'], 0),
    ),
    clases_consumidas: Number(
      pick(raw, ['clases_consumidas', 'consumidas', 'usadas'], 0),
    ),
    fecha_inicio: String(
      pick(raw, ['fecha_inicio', 'inicio', 'valid_from', 'vigencia_desde'], ''),
    ),
    fecha_fin: String(
      pick(
        raw,
        ['fecha_fin', 'fin', 'valid_until', 'vigencia_hasta', 'vencimiento'],
        '',
      ),
    ),
    estado: String(pick(raw, ['estado', 'status'], 'vigente')),
  } as any;
}

// ---------- PAGO ----------
export function mapPago(raw: any): Pago {
  return {
    pago_id: pick(raw, ['pago_id', 'id']),
    cliente_id: pick(raw, ['cliente_id', 'client_id']),
    monto: Number(pick(raw, ['monto', 'monto_total', 'amount', 'total'], 0)),
    metodo_pago: String(
      pick(raw, ['metodo_pago', 'metodo', 'method', 'payment_method'], ''),
    ),
    estado: String(pick(raw, ['estado', 'status'], '')),
    referencia_externa: pick(
      raw,
      ['referencia_externa', 'reference', 'external_ref'],
      null,
    ),
    pagado_en: String(
      pick(raw, ['pagado_en', 'fecha', 'fecha_pago', 'created_at'], ''),
    ),
  } as any;
}

// ---------- ALUMNA ----------
export function mapAlumna(raw: any): Alumna {
  return {
    id: pick(raw, ['id', 'cliente_id']),
    user_id: pick(raw, ['user_id', 'usuario_id']),
    nombre: String(pick(raw, ['nombre', 'name', 'first_name'], '')),
    apellido: String(pick(raw, ['apellido', 'last_name'], '')),
    email: pick(raw, ['email', 'correo']),
    telefono: pick(raw, ['telefono', 'phone'], null),
    foto_url: pick(raw, ['foto_url', 'avatar', 'avatarUrl'], null),
    activo: pick(raw, ['activo'], 1),
  } as any;
}
