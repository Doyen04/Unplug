import { Bell } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface DashboardHeaderProps {
  alertsCount: number;
  onOpenAlerts: () => void;
  userInitials: string;
}

export function DashboardHeader({
  alertsCount,
  onOpenAlerts,
  userInitials,
}: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Dashboard</h1>
      <div className="hidden lg:flex items-center gap-5">
        <div className="relative group">
          <Button
            variant="secondary"
            size="icon"
            onClick={onOpenAlerts}
            className="rounded-full h-10 w-10"
          >
            <Bell size={18} />
            {alertsCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-bg-surface bg-danger text-[10px] font-bold text-white">
                {alertsCount}
              </span>
            )}
          </Button>
        </div>
        <div className="h-10 w-10 overflow-hidden rounded-full border border-border-strong ring-2 ring-brand/45">
          <div className="flex h-full w-full items-center justify-center bg-text-primary text-sm font-medium text-white">
            {userInitials}
          </div>
        </div>
      </div>
    </header>
  );
}
