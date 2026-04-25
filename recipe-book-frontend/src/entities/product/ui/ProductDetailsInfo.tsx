import { Product } from '@/entities/product/model/types';
import { cookingRequirementLabels, dietFlagLabels, productCategoryLabels } from '@/entities/product/model/constants';
import { formatDate, formatNumber } from '@/shared/lib/format';
import { Card } from '@/shared/ui/Card';
import { PhotoGallery } from '@/shared/ui/PhotoGallery';

type ProductDetailsInfoProps = {
    product: Product;
};

export function ProductDetailsInfo({ product }: ProductDetailsInfoProps) {
    return (
        <div className="details-layout">
            <Card>
                <h2>{product.name}</h2>
                <PhotoGallery urls={product.photoUrls ?? []} />
            </Card>
            <Card>
                <h3>Основные данные</h3>
                <dl className="details-list">
                    <dt>Категория</dt>
                    <dd>{productCategoryLabels[product.category]}</dd>
                    <dt>Необходимость готовки</dt>
                    <dd>{cookingRequirementLabels[product.cookingRequirement]}</dd>
                    <dt>Состав</dt>
                    <dd>{product.composition || '—'}</dd>
                    <dt>Создан</dt>
                    <dd>{formatDate(product.createdAt)}</dd>
                    <dt>Изменён</dt>
                    <dd>{formatDate(product.updatedAt)}</dd>
                </dl>
            </Card>
            <Card>
                <h3>КБЖУ на 100 г</h3>
                <div className="nutrition-grid large">
                    <span>Ккал: {formatNumber(product.nutrition.calories)}</span>
                    <span>Белки: {formatNumber(product.nutrition.proteins)}</span>
                    <span>Жиры: {formatNumber(product.nutrition.fats)}</span>
                    <span>Углеводы: {formatNumber(product.nutrition.carbohydrates)}</span>
                </div>
            </Card>
            <Card>
                <h3>Флаги</h3>
                <div className="chips">
                    {product.flags.length ? product.flags.map((flag) => <span key={flag} className="chip">{dietFlagLabels[flag]}</span>) : <span className="muted">Флаги не указаны</span>}
                </div>
            </Card>
        </div>
    );
}
