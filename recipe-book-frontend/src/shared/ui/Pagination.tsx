import { Button } from '@/shared/ui/Button';

type PaginationProps = {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="pagination">
            <Button variant="secondary" disabled={page <= 0} onClick={() => onPageChange(page - 1)}>
                Назад
            </Button>
            <span>
                Страница {page + 1} из {totalPages}
            </span>
            <Button variant="secondary" disabled={page + 1 >= totalPages} onClick={() => onPageChange(page + 1)}>
                Вперёд
            </Button>
        </div>
    );
}
