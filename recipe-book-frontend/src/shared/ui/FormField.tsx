import { PropsWithChildren } from 'react';

type FormFieldProps = PropsWithChildren<{
    label: string;
    error?: string;
}>;

export function FormField({ label, error, children }: FormFieldProps) {
    return (
        <label className="form-field">
            <span>{label}</span>
            {children}
            {error ? <small className="form-error">{error}</small> : null}
        </label>
    );
}
