import { api } from './client';
import type { Alumna, Clase, Reserva, Plan, Pago } from '../types/alumna';

export const getClases   = async () => (await api.get<Clase[]>('/clases')).data;
export const getReservas = async () => (await api.get<Reserva[]>('/reservas')).data;
export const getPlanes   = async () => (await api.get<Plan[]>('/planes')).data;
export const getPagos    = async () => (await api.get<Pago[]>('/pagos')).data;
export const getPerfil   = async () => (await api.get<Alumna>('/perfil')).data;
