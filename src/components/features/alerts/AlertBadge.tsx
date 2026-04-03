import type { AlertType } from '../../../types/subscription';

interface AlertBadgeProps {
  type: AlertType;
  message: string;
}

const typeClassMap: Record<AlertType, string> = {
  unused: 'bg-red-950 text-red-400 border-red-800',
  'trial-ending': 'bg-amber-950 text-amber-400 border-amber-800',
  'price-hike': 'bg-amber-950 text-amber-400 border-amber-800',
  dormant: 'bg-red-950 text-red-500 border-red-800',
};

export const AlertBadge = ({ type, message }: AlertBadgeProps) => (
  <span
    className={`inline-flex items-center border px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] ${typeClassMap[type]}`}
    aria-label={`Alert ${type}: ${message}`}
  >
    {message}
  </span>
);
