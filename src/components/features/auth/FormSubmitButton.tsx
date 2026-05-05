'use client';

import { useFormStatus } from 'react-dom';
import { Button, type ButtonProps } from '@/components/ui/Button';

interface FormSubmitButtonProps extends ButtonProps {
    idleLabel: string;
    pendingLabel: string;
}

export const FormSubmitButton = ({
    idleLabel,
    pendingLabel,
    className,
    variant,
    size,
    ...props
}: FormSubmitButtonProps) => {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending}
            className={className}
            variant={variant}
            size={size}
            {...props}
        >
            {pending ? pendingLabel : idleLabel}
        </Button>
    );
};
