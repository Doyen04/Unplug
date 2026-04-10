interface DashboardAlertsPanelProps {
  alerts: Array<{ id: string; label: string; type: string }>;
}

export const DashboardAlertsPanel = ({ alerts }: DashboardAlertsPanelProps) => (
  <aside className="flex h-full min-h-0 flex-col rounded-2xl border border-[#E8E7E0] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
    <p className="shrink-0 text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">
      Alerts ({alerts.length})
    </p>

    <ul className="mt-4 min-h-0 space-y-3 overflow-y-auto pr-1">
      {alerts.length === 0 ? (
        <li className="text-sm text-[#6B6960]">No active alerts.</li>
      ) : (
        alerts.map((alert) => (
          <li key={alert.id} className="border-l-2 border-[#E8860A] pl-3 text-sm text-[#1A1A17]">
            {alert.label}
          </li>
        ))
      )}
    </ul>
  </aside>
);
