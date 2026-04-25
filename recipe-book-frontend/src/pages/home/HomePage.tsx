import { Link } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { PageHeader } from '@/shared/ui/PageHeader';

export function HomePage() {
    return (
        <>
            <PageHeader
                title="Книга рецептов"
                subtitle="Фронтенд для управления продуктами и блюдами"
            />
            <div className="home-grid">
                <Card>
                    <h2>Продукты</h2>
                    <p>Создание, просмотр, редактирование, удаление, фильтрация, поиск и сортировка продуктов.</p>
                    <Link className="button button-primary" to="/products">
                        Перейти к продуктам
                    </Link>
                </Card>
                <Card>
                    <h2>Блюда</h2>
                    <p>Создание блюд из продуктов, автоматический расчёт КБЖУ, макросы категорий и проверка флагов.</p>
                    <Link className="button button-primary" to="/dishes">
                        Перейти к блюдам
                    </Link>
                </Card>
            </div>
        </>
    );
}
