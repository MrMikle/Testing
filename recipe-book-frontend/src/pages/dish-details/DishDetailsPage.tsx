import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDeleteDishMutation, useGetDishQuery } from '@/entities/dish/api/dishApi';
import { DishDetailsInfo } from '@/entities/dish/ui/DishDetailsInfo';
import { getErrorMessage } from '@/shared/lib/apiError';
import { Button } from '@/shared/ui/Button';
import { PageHeader } from '@/shared/ui/PageHeader';
import { PageState } from '@/shared/ui/PageState';

export function DishDetailsPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const dishId = Number(id);
    const { data: dish, isLoading, error } = useGetDishQuery(dishId, { skip: !dishId });
    const [deleteDish] = useDeleteDishMutation();

    const handleDelete = async () => {
        if (!dish || !window.confirm('Удалить блюдо?')) {
            return;
        }
        try {
            await deleteDish(dish.id).unwrap();
            navigate('/dishes');
        } catch (deleteError) {
            window.alert(getErrorMessage(deleteError));
        }
    };

    return (
        <>
            <PageHeader title="Карточка блюда">
                {dish ? (
                    <>
                        <Link className="button button-secondary" to={`/dishes/${dish.id}/edit`}>
                            Изменить
                        </Link>
                        <Button variant="danger" onClick={handleDelete}>
                            Удалить
                        </Button>
                    </>
                ) : null}
            </PageHeader>
            <PageState loading={isLoading} error={error || (!dishId ? true : undefined)} />
            {dish ? <DishDetailsInfo dish={dish} /> : null}
        </>
    );
}
