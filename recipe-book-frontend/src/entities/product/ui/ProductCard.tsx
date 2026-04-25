import { Link } from 'react-router-dom';
import { Product } from '@/entities/product/model/types';
import { cookingRequirementLabels, dietFlagLabels, productCategoryLabels } from '@/entities/product/model/constants';
import { formatNumber } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

type ProductCardProps = {
    product: Product;
    onDelete?: (id: number) => void;
};

export function ProductCard({ product, onDelete }: ProductCardProps) {
    return (
        <Card>
            <div className="card-top">
                <div>
                    <h3>{product.name}</h3>
                    <p>{productCategoryLabels[product.category]} · {cookingRequirementLabels[product.cookingRequirement]}</p>
                </div>
                <div className="card-actions">
                    <Link className="button button-secondary" to={`/products/${product.id}`}>
                        Открыть
                    </Link>
                    <Link className="button button-ghost" to={`/products/${product.id}/edit`}>
                        Изменить
                    </Link>
                    {onDelete ? (
                        <Button variant="danger" onClick={() => onDelete(product.id)}>
                            Удалить
                        </Button>
                    ) : null}
                </div>
            </div>
            <div className="nutrition-grid">
                <span>Ккал: {formatNumber(product.nutrition.calories)}</span>
                <span>Б: {formatNumber(product.nutrition.proteins)}</span>
                <span>Ж: {formatNumber(product.nutrition.fats)}</span>
                <span>У: {formatNumber(product.nutrition.carbohydrates)}</span>
            </div>
            <div className="chips">
                {product.flags.length ? product.flags.map((flag) => <span key={flag} className="chip">{dietFlagLabels[flag]}</span>) : <span className="muted">Флаги не указаны</span>}
            </div>
        </Card>
    );
}
