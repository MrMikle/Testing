export function formatNumber(value: number | null | undefined, digits = 2) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '—';
    }
    return new Intl.NumberFormat('ru-RU', {
        maximumFractionDigits: digits,
        minimumFractionDigits: 0
    }).format(value);
}

export function formatDate(value: string | null | undefined) {
    if (!value) {
        return '—';
    }
    return new Intl.DateTimeFormat('ru-RU', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(new Date(value));
}

export function toNumberOrNull(value: string) {
    if (value.trim() === '') {
        return null;
    }
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
}

export function toNumberOrZero(value: string) {
    const parsed = toNumberOrNull(value);
    return parsed ?? 0;
}
