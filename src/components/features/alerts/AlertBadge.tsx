import type { AlertType } from '../../../types/subscription';

interface AlertBadgeProps {
  type: AlertType;
  message: string;
}

const toSentenceCase = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return '';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const typeConfig: Record<AlertType, { bg: string; text: string; icon: string }> = {
  unused: {
    bg: 'bg-danger-light',
    text: 'text-danger',
    icon: '●',
  },
  'trial-ending': {
    bg: 'bg-warning-light',
    text: 'text-warning',
    icon: '●',
  },
  'price-hike': {
    bg: 'bg-warning-light',
    text: 'text-warning',
    icon: '↑',
  },
  dormant: {
    bg: 'bg-danger-light',
    text: 'text-danger',
    icon: 'zzZ',
  },
};

export const AlertBadge = ({ type, message }: AlertBadgeProps) => {
  const config = typeConfig[type];
  const displayMessage = toSentenceCase(message);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.03em] ${config.bg} ${config.text}`}
      aria-label={`Alert: ${message}`}
    >
      <span className="text-[9px]" aria-hidden="true">{config.icon}</span>
      {displayMessage}
    </span>
  );
};
