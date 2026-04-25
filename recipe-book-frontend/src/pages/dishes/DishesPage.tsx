import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDeleteDishMutation, useGetDishesQuery } from '@/entities/dish/api/dishApi';
import { DishCard } from '@/entities/dish/ui/DishCard';
import { DishFilters, DishFiltersValue } from '@/entities/dish/ui/DishFilters';
import { getErrorMessage } from '@/shared/lib/apiError';
import { Button } from '@/shared/ui/Button';
import { PageHeader } from '@/shared/ui/PageHeader';
import { PageState } from '@/shared/ui/PageState';
import { Pagination } from '@/shared/ui/Pagination';

const initialFilters: DishFiltersValue = {
    search: '',
    category: '',
    vegan: false,
    glutenFree: false,
    sugarFree: false,
    direction: 'ASC'
};

export function DishesPage() {
    const [filters, setFilters] = useState(initialFilters);
    const [page, setPage] = useState(0);
    const [deleteDish] = useDeleteDishMutation();

    const { data, isLoading, error } = useGetDishesQuery({
        ...filters,
        vegan: filters.vegan || undefined,
        glutenFree: filters.glutenFree || undefined,
        sugarFree: filters.sugarFree || undefined,
        page,
        size: 12
    });

    const changeFilters = (value: DishFiltersValue) => {
        setFilters(value);
        setPage(0);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Удалить блюдо?')) {
            return;
        }
        try {
            await deleteDish(id).unwrap();
        } catch (deleteError) {
            window.alert(getErrorMessage(deleteError));
        }
    };

    return (
        <>
            <PageHeader title="Блюда" subtitle="Список блюд с фильтрацией и поиском">
                <Link className="button button-primary" to="/dishes/new">
                    Создать блюдо
                </Link>
            </PageHeader>
            <DishFilters value={filters} onChange={changeFilters} onReset={() => changeFilters(initialFilters)} />
            <PageState loading={isLoading} error={error} empty={data?.empty} emptyText="Блюда не найдены" />
            <div className="cards-grid">
                {data?.content.map((dish) => (
                    <DishCard key={dish.id} dish={dish} onDelete={handleDelete} />
                ))}
            </div>
            <Pagination page={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
            <div className="bottom-actions">
                <Button variant="secondary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    Наверх
                </Button>
            </div>
        </>
    );
}
