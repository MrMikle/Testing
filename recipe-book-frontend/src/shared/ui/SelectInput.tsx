import { SelectHTMLAttributes } from 'react';

export type SelectOption = {
    value: string;
    label: string;
};

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
    options: SelectOption[];
    emptyLabel?: string;
};

export function SelectInput({ options, emptyLabel, ...props }: SelectInputProps) {
    return (
        <select className="input" {...props}>
            {emptyLabel !== undefined ? <option value="">{emptyLabel}</option> : null}
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}
