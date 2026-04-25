export type CheckboxOption<T extends string> = {
    value: T;
    label: string;
    disabled?: boolean;
};

type CheckboxGroupProps<T extends string> = {
    options: CheckboxOption<T>[];
    value: T[];
    onChange: (value: T[]) => void;
};

export function CheckboxGroup<T extends string>({ options, value, onChange }: CheckboxGroupProps<T>) {
    const toggle = (optionValue: T, checked: boolean) => {
        if (checked) {
            onChange([...new Set([...value, optionValue])]);
            return;
        }
        onChange(value.filter((item) => item !== optionValue));
    };

    return (
        <div className="checkbox-group">
            {options.map((option) => (
                <label key={option.value} className="checkbox-item">
                    <input
                        type="checkbox"
                        checked={value.includes(option.value)}
                        disabled={option.disabled}
                        onChange={(event) => toggle(option.value, event.target.checked)}
                    />
                    <span>{option.label}</span>
                </label>
            ))}
        </div>
    );
}
