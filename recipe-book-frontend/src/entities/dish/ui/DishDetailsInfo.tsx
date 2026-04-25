import { Link } from 'react-router-dom';
import { Dish } from '@/entities/dish/model/types';
import { dishCategoryLabels } from '@/entities/dish/model/constants';
import { dietFlagLabels } from '@/entities/product/model/constants';
import { formatDate, formatNumber } from '@/shared/lib/format';
import { Card } from '@/shared/ui/Card';
import { PhotoGallery } from '@/shared/ui/PhotoGallery';

type DishDetailsInfoProps = {
    dish: Dish;
};

export function DishDetailsInfo({ dish }: DishDetailsInfoProps) {
    return (
        <div className="details-layout">
            <Card>
                <h2>{dish.name}</h2>
                <PhotoGallery urls={dish.photoUrls ?? []} />
            </Card>
            <Card>
                <h3>Основные данные</h3>
                <dl className="details-list">
                    <dt>Категория</dt>
                    <dd>{dishCategoryLabels[dish.category]}</dd>
                    <dt>Размер порции</dt>
                    <dd>{formatNumber(dish.servingSizeGrams)} г</dd>
                    <dt>Создано</dt>
                    <dd>{formatDate(dish.createdAt)}</dd>
                    <dt>Изменено</dt>
                    <dd>{formatDate(dish.updatedAt)}</dd>
                </dl>
            </Card>
            <Card>
                <h3>КБЖУ на порцию</h3>
                <div className="nutrition-grid large">
                    <span>Ккал: {formatNumber(dish.nutrition.calories)}</span>
                    <span>Белки: {formatNumber(dish.nutrition.proteins)}</span>
                    <span>Жиры: {formatNumber(dish.nutrition.fats)}</span>
                    <span>Углеводы: {formatNumber(dish.nutrition.carbohydrates)}</span>
                </div>
            </Card>
            <Card>
                <h3>Состав</h3>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Продукт</th>
                                <th>Количество</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dish.ingredients.map((ingredient) => (
                                <tr key={`${ingredient.productId}-${ingredient.productName}`}>
                                    <td>
                                        <Link to={`/products/${ingredient.productId}`}>{ingredient.productName}</Link>
                                    </td>
                                    <td>{formatNumber(ingredient.quantityGrams)} г</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            <Card>
                <h3>Флаги</h3>
                <div className="chips">
                    {dish.flags.length ? dish.flags.map((flag) => <span key={flag} className="chip">{dietFlagLabels[flag]}</span>) : <span className="muted">Флаги не указаны</span>}
                </div>
            </Card>
        </div>
    );
}
