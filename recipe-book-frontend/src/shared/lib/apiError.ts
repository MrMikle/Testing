type ErrorWithData = {
    status?: number | string;
    data?: unknown;
};

type ProblemDetail = {
    title?: string;
    detail?: string;
    message?: string;
    errors?: unknown;
    dishNames?: string[];
};

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

export function getErrorMessage(error: unknown) {
    const candidate = error as ErrorWithData;
    const data = candidate?.data;

    if (typeof data === 'string') {
        return data;
    }

    if (isObject(data)) {
        const problem = data as ProblemDetail;
        const parts = [problem.detail, problem.message, problem.title].filter(Boolean);
        if (problem.dishNames?.length) {
            parts.push(`Используется в блюдах: ${problem.dishNames.join(', ')}`);
        }
        if (parts.length) {
            return parts.join('. ');
        }
    }

    if (candidate?.status) {
        return `Ошибка сервера: ${candidate.status}`;
    }

    return 'Произошла ошибка';
}
