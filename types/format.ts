import { format as dfFormat } from "date-fns";

export const fmtMoneda = (n: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);

export const fmtDia = (yyyy_mm_dd: string) => {
  const d = new Date(`${yyyy_mm_dd}T00:00:00`);
  return Number.isNaN(d.getTime()) ? yyyy_mm_dd : dfFormat(d, "dd-MM-yyyy");
};

export const fmtHora = (hh_mm_ss: string) => {
  const [h = "00", m = "00"] = hh_mm_ss.split(":");
  return `${h}:${m}`;
};

export const initials = (n?: string, a?: string) =>
  `${(n?.[0] ?? "").toUpperCase()}${(a?.[0] ?? "").toUpperCase()}` || "A";
