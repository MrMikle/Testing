import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDeleteProductMutation, useGetProductsQuery } from '@/entities/product/api/productApi';
import { ProductCard } from '@/entities/product/ui/ProductCard';
import { ProductFilters, ProductFiltersValue } from '@/entities/product/ui/ProductFilters';
import { getErrorMessage } from '@/shared/lib/apiError';
import { Button } from '@/shared/ui/Button';
import { PageHeader } from '@/shared/ui/PageHeader';
import { PageState } from '@/shared/ui/PageState';
import { Pagination } from '@/shared/ui/Pagination';

const initialFilters: ProductFiltersValue = {
    search: '',
    category: '',
    cookingRequirement: '',
    vegan: false,
    glutenFree: false,
    sugarFree: false,
    sortBy: 'name',
    direction: 'ASC'
};

export function ProductsPage() {
    const [filters, setFilters] = useState(initialFilters);
    const [page, setPage] = useState(0);
    const [deleteProduct] = useDeleteProductMutation();

    const { data, isLoading, error } = useGetProductsQuery({
        ...filters,
        vegan: filters.vegan || undefined,
        glutenFree: filters.glutenFree || undefined,
        sugarFree: filters.sugarFree || undefined,
        page,
        size: 12
    });

    const changeFilters = (value: ProductFiltersValue) => {
        setFilters(value);
        setPage(0);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Удалить продукт?')) {
            return;
        }
        try {
            await deleteProduct(id).unwrap();
        } catch (deleteError) {
            window.alert(getErrorMessage(deleteError));
        }
    };

    return (
        <>
            <PageHeader title="Продукты" subtitle="Список продуктов с фильтрацией, поиском и сортировкой">
                <Link className="button button-primary" to="/products/new">
                    Создать продукт
                </Link>
            </PageHeader>
            <ProductFilters value={filters} onChange={changeFilters} onReset={() => changeFilters(initialFilters)} />
            <PageState loading={isLoading} error={error} empty={data?.empty} emptyText="Продукты не найдены" />
            <div className="cards-grid">
                {data?.content.map((product) => (
                    <ProductCard key={product.id} product={product} onDelete={handleDelete} />
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
