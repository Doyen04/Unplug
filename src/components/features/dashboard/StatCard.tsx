import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string;
  variant?: 'default' | 'danger' | 'success';
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    text: string;
    isGood: boolean;
  };
  index?: number;
}

const variantValueClass: Record<NonNullable<StatCardProps['variant']>, string> = {
  default: 'text-text-primary',
  danger: 'text-danger',
  success: 'text-success',
};

const trendArrow: Record<string, string> = {
  up: '↑',
  down: '↓',
  neutral: '→',
};

export const StatCard = ({
  label,
  value,
  variant = 'default',
  trend,
  index = 0,
}: StatCardProps) => (
  <motion.article
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.35,
      ease: [0.34, 1.56, 0.64, 1],
      delay: index * 0.06,
    }}
    className="rounded-card border border-border bg-white p-6 shadow-card card-hover"
  >
    <p className="text-[13px] font-medium uppercase tracking-[0.05em] text-text-muted">
      {label}
    </p>
    <p className={`mt-2 font-display text-4xl font-bold leading-none ${variantValueClass[variant]}`}>
      {value}
    </p>
    {trend && (
      <p
        className={`mt-1 text-[13px] ${
          trend.isGood ? 'text-success' : 'text-danger'
        }`}
      >
        {trendArrow[trend.direction]} {trend.text}
      </p>
    )}
  </motion.article>
);
