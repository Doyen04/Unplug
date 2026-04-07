'use client';

import { useFormStatus } from 'react-dom';

interface FormSubmitButtonProps {
    idleLabel: string;
    pendingLabel: string;
    className: string;
}

export const FormSubmitButton = ({ idleLabel, pendingLabel, className }: FormSubmitButtonProps) => {
    const { pending } = useFormStatus();

    return (
        <button type="submit" disabled={pending} className={className}>
            {pending ? pendingLabel : idleLabel}
        </button>
    );
};
