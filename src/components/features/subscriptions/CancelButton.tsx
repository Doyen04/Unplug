import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CancelButtonProps {
  subscriptionId: string;
  serviceName: string;
  onSuccess: () => void | Promise<void>;
  disabled?: boolean;
}

export const CancelButton = ({
  subscriptionId,
  serviceName,
  onSuccess,
  disabled = false,
}: CancelButtonProps) => {
  return (
    <Button
      variant="outline"
      size="icon"
      className="h-9 w-9 rounded-full border-danger/20 text-danger hover:bg-danger hover:text-white hover:border-danger transition-all"
      disabled={disabled}
      onClick={() => void onSuccess()}
      aria-label={`Cancel ${serviceName} subscription`}
    >
      <Trash2 size={16} />
    </Button>
  );
};
