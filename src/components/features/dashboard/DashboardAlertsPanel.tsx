interface DashboardAlertsPanelProps {
  alerts: Array<{ id: string; label: string; type: string }>;
}

export const DashboardAlertsPanel = ({ alerts }: DashboardAlertsPanelProps) => (
  <aside className="flex h-full min-h-0 flex-col border border-stone-800 bg-stone-900 p-5">
    <p className="shrink-0 text-[11px] uppercase tracking-[0.08em] text-stone-500">
      Alerts ({alerts.length})
    </p>

    <ul className="mt-4 min-h-0 space-y-3 overflow-y-auto pr-1">
      {alerts.length === 0 ? (
        <li className="text-sm text-stone-500">No active alerts.</li>
      ) : (
        alerts.map((alert) => (
          <li key={alert.id} className="border-l-2 border-amber-500 pl-3 text-sm text-stone-300">
            {alert.label}
          </li>
        ))
      )}
    </ul>
  </aside>
);
