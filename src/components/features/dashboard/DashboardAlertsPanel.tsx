import { AlertTriangle, Bell, TrendingUp, Moon } from 'lucide-react';
import type { AlertType } from '../../../types/subscription';

interface DashboardAlertsPanelProps {
  alerts: Array<{ id: string; label: string; type: string }>;
}

const alertTypeConfig: Record<string, { icon: typeof Bell; borderColor: string; textColor: string }> = {
  unused: { icon: AlertTriangle, borderColor: 'border-l-danger', textColor: 'text-danger' },
  'trial-ending': { icon: Bell, borderColor: 'border-l-warning', textColor: 'text-warning' },
  'price-hike': { icon: TrendingUp, borderColor: 'border-l-warning', textColor: 'text-warning' },
  dormant: { icon: Moon, borderColor: 'border-l-danger', textColor: 'text-danger' },
};

export const DashboardAlertsPanel = ({ alerts }: DashboardAlertsPanelProps) => (
  <aside className="flex h-full min-h-0 flex-col rounded-card border border-border bg-white p-5 shadow-card">
    <div className="flex shrink-0 items-center justify-between">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
        Alerts
      </p>
      {alerts.length > 0 && (
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
          {alerts.length}
        </span>
      )}
    </div>

    <ul className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
      {alerts.length === 0 ? (
        <li className="flex flex-col items-center gap-2 py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-light">
            <Bell size={18} className="text-success" />
          </div>
          <p className="text-[13px] font-medium text-text-primary">All clear</p>
          <p className="text-[11px] text-text-muted">No active alerts right now.</p>
        </li>
      ) : (
        alerts.map((alert) => {
          const config = alertTypeConfig[alert.type] ?? alertTypeConfig.unused;
          const IconComponent = config.icon;

          return (
            <li
              key={alert.id}
              className={`flex items-start gap-2.5 rounded-tag border-l-[3px] ${config.borderColor} bg-bg-muted px-3 py-2.5`}
            >
              <IconComponent size={14} className={`mt-0.5 shrink-0 ${config.textColor}`} />
              <p className="text-[13px] text-text-primary">{alert.label}</p>
            </li>
          );
        })
      )}
    </ul>
  </aside>
);
