import { Link } from 'react-router-dom';
import { Dish } from '@/entities/dish/model/types';
import { dishCategoryLabels } from '@/entities/dish/model/constants';
import { dietFlagLabels } from '@/entities/product/model/constants';
import { formatNumber } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

type DishCardProps = {
    dish: Dish;
    onDelete?: (id: number) => void;
};

export function DishCard({ dish, onDelete }: DishCardProps) {
    return (
        <Card>
            <div className="card-top">
                <div>
                    <h3>{dish.name}</h3>
                    <p>{dishCategoryLabels[dish.category]} · порция {formatNumber(dish.servingSizeGrams)} г</p>
                </div>
                <div className="card-actions">
                    <Link className="button button-secondary" to={`/dishes/${dish.id}`}>
                        Открыть
                    </Link>
                    <Link className="button button-ghost" to={`/dishes/${dish.id}/edit`}>
                        Изменить
                    </Link>
                    {onDelete ? (
                        <Button variant="danger" onClick={() => onDelete(dish.id)}>
                            Удалить
                        </Button>
                    ) : null}
                </div>
            </div>
            <div className="nutrition-grid">
                <span>Ккал: {formatNumber(dish.nutrition.calories)}</span>
                <span>Б: {formatNumber(dish.nutrition.proteins)}</span>
                <span>Ж: {formatNumber(dish.nutrition.fats)}</span>
                <span>У: {formatNumber(dish.nutrition.carbohydrates)}</span>
            </div>
            <div className="chips">
                {dish.flags.length ? dish.flags.map((flag) => <span key={flag} className="chip">{dietFlagLabels[flag]}</span>) : <span className="muted">Флаги не указаны</span>}
            </div>
        </Card>
    );
}
