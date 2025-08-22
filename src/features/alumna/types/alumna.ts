export type ID = string | number;

export interface Clase {
  id: ID;
  nombre: string;
  fecha: string; // ISO
  hora: string;  // HH:mm
  cupos: number;
}

export interface Reserva {
  id: ID;
  claseId: ID;
  estado: 'confirmada' | 'en-espera' | 'cancelada';
}

export interface Plan {
  id: ID;
  nombre: string;
  vigenciaHasta: string; // ISO
  creditos: number;
}

export interface Pago {
  id: ID;
  monto: number;
  fecha: string; // ISO
  medio: 'efectivo' | 'transferencia' | 'tarjeta';
}

export interface Alumna {
  id: ID;
  nombre: string;
  email: string;
  avatarUrl?: string;
}
