import { NavLink, Route, Routes } from 'react-router-dom';
import { DishCreatePage } from '@/pages/dish-create/DishCreatePage';
import { DishDetailsPage } from '@/pages/dish-details/DishDetailsPage';
import { DishEditPage } from '@/pages/dish-edit/DishEditPage';
import { DishesPage } from '@/pages/dishes/DishesPage';
import { HomePage } from '@/pages/home/HomePage';
import { ProductCreatePage } from '@/pages/product-create/ProductCreatePage';
import { ProductDetailsPage } from '@/pages/product-details/ProductDetailsPage';
import { ProductEditPage } from '@/pages/product-edit/ProductEditPage';
import { ProductsPage } from '@/pages/products/ProductsPage';

export function App() {
    return (
        <div className="app-shell">
            <header className="topbar">
                <NavLink to="/" className="brand">
                    Книга рецептов
                </NavLink>
                <nav>
                    <NavLink to="/products">Продукты</NavLink>
                    <NavLink to="/dishes">Блюда</NavLink>
                </nav>
            </header>
            <main className="main">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/new" element={<ProductCreatePage />} />
                    <Route path="/products/:id" element={<ProductDetailsPage />} />
                    <Route path="/products/:id/edit" element={<ProductEditPage />} />
                    <Route path="/dishes" element={<DishesPage />} />
                    <Route path="/dishes/new" element={<DishCreatePage />} />
                    <Route path="/dishes/:id" element={<DishDetailsPage />} />
                    <Route path="/dishes/:id/edit" element={<DishEditPage />} />
                </Routes>
            </main>
        </div>
    );
}
