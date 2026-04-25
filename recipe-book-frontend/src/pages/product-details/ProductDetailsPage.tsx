import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDeleteProductMutation, useGetProductQuery } from '@/entities/product/api/productApi';
import { ProductDetailsInfo } from '@/entities/product/ui/ProductDetailsInfo';
import { getErrorMessage } from '@/shared/lib/apiError';
import { Button } from '@/shared/ui/Button';
import { PageHeader } from '@/shared/ui/PageHeader';
import { PageState } from '@/shared/ui/PageState';

export function ProductDetailsPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const productId = Number(id);
    const { data: product, isLoading, error } = useGetProductQuery(productId, { skip: !productId });
    const [deleteProduct] = useDeleteProductMutation();

    const handleDelete = async () => {
        if (!product || !window.confirm('Удалить продукт?')) {
            return;
        }
        try {
            await deleteProduct(product.id).unwrap();
            navigate('/products');
        } catch (deleteError) {
            window.alert(getErrorMessage(deleteError));
        }
    };

    return (
        <>
            <PageHeader title="Карточка продукта">
                {product ? (
                    <>
                        <Link className="button button-secondary" to={`/products/${product.id}/edit`}>
                            Изменить
                        </Link>
                        <Button variant="danger" onClick={handleDelete}>
                            Удалить
                        </Button>
                    </>
                ) : null}
            </PageHeader>
            <PageState loading={isLoading} error={error || (!productId ? true : undefined)} />
            {product ? <ProductDetailsInfo product={product} /> : null}
        </>
    );
}
