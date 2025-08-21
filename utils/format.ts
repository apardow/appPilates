// appPilates/utils/format.ts
import { format } from "date-fns";

export function fmtMoneda(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n ?? 0);
}

export function fmtDia(yyyy_mm_dd: string) {
  const d = new Date(`${yyyy_mm_dd}T00:00:00`);
  return isNaN(d.getTime()) ? yyyy_mm_dd : format(d, "dd-MM-yyyy");
}

export function fmtHora(hh_mm_ss: string) {
  const [h, m] = (hh_mm_ss || "").split(":");
  return h && m ? `${h}:${m}` : hh_mm_ss;
}

export function initials(n?: string, a?: string) {
  const i = `${(n?.[0] ?? "").toUpperCase()}${(a?.[0] ?? "").toUpperCase()}`;
  return i || "A";
}
