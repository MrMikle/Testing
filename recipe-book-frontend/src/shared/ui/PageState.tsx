type PageStateProps = {
    loading?: boolean;
    error?: unknown;
    empty?: boolean;
    emptyText?: string;
};

export function PageState({ loading, error, empty, emptyText = 'Данных пока нет' }: PageStateProps) {
    if (loading) {
        return <div className="state state-loading">Загрузка...</div>;
    }
    if (error) {
        return <div className="state state-error">Ошибка загрузки данных</div>;
    }
    if (empty) {
        return <div className="state state-empty">{emptyText}</div>;
    }
    return null;
}
