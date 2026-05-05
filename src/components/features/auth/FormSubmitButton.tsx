'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '../../ui/Button';

interface FormSubmitButtonProps {
    idleLabel: string;
    pendingLabel: string;
    className?: string;
}

export const FormSubmitButton = ({ idleLabel, pendingLabel, className }: FormSubmitButtonProps) => {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending}
            className={className}
        >
            {pending ? pendingLabel : idleLabel}
        </Button>
    );
};
