// components/common/StatusBadges.tsx
import type { PlanAlumna, ActividadAlumna } from '../../types/alumna';

export const Badge = ({
  text,
  className = '',
  title,
}: {
  text: string;
  className?: string;
  title?: string;
}) => (
  <span
    title={title}
    className={`text-xs px-2 py-1 rounded border uppercase ${className}`}
  >
    {text}
  </span>
);

export const BadgePlan = ({ estado }: { estado: PlanAlumna['estado'] }) => {
  const map: Record<PlanAlumna['estado'], string> = {
    vigente: 'border-green-600 text-green-700 bg-green-50',
    consumido: 'border-blue-700 text-blue-700 bg-blue-50',
    caducado: 'border-yellow-700 text-yellow-800 bg-yellow-50',
    eliminado: 'border-red-700 text-red-700 bg-red-50',
  };
  return <Badge text={estado} className={map[estado]} />;
};

export const BadgeActividad = ({
  estado,
  title,
}: {
  estado: ActividadAlumna['estado'];
  title?: string;
}) => {
  const map: Record<ActividadAlumna['estado'], string> = {
    activa: 'border-indigo-600 text-indigo-700 bg-indigo-50',
    asistida: 'border-green-700 text-green-700 bg-green-50',
    cancelada_a_tiempo: 'border-yellow-700 text-yellow-800 bg-yellow-50',
    cancelada_tarde: 'border-orange-700 text-orange-800 bg-orange-50',
    ausente: 'border-red-700 text-red-700 bg-red-50',
  };
  const pretty = estado.replaceAll('_', ' ');
  return <Badge text={pretty} className={map[estado]} title={title} />;
};
