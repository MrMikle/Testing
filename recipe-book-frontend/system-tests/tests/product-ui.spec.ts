import { expect, test } from '@playwright/test';
import { ProductFormData, assetPath, productBoundaryValues, products } from '../fixtures/testData';
import { ProductFormPage } from '../pages/ProductFormPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { ProductsPage } from '../pages/ProductsPage';
import { createProductThroughUi } from '../helpers/createEntities';

/**
 * Системные UI-тесты раздела продуктов.
 *
 * Проверяют создание, валидацию, граничные значения, загрузку фотографий,
 * бизнес-правила флагов, поиск, фильтрацию, сортировку, редактирование
 * и просмотр карточки продукта через пользовательский интерфейс.
 */

function withUniqueName(product: ProductFormData, name: string): ProductFormData {
    return {
        ...product,
        name
    };
}

function productWithNutrition(name: string, calories: string, proteins: string, fats: string, carbohydrates: string): ProductFormData {
    return {
        name,
        category: 'Овощи',
        cookingRequirement: 'Готовый к употреблению',
        calories,
        proteins,
        fats,
        carbohydrates,
        composition: 'Тестовый продукт',
        flags: ['Веган', 'Без глютена', 'Без сахара'],
        photos: []
    };
}

test.describe('Product UI system tests', () => {
    /**
     * Проверяет создание валидных продуктов.
     */
    test('creates valid products from different equivalence classes', async ({ page }) => {
        const suffix = Date.now().toString();

        const productsPage = new ProductsPage(page);

        const potato = withUniqueName(products.potato, `Картофель UI ${suffix}`);
        const water = withUniqueName(products.water, `Вода UI ${suffix}`);
        const meat = withUniqueName(products.meat, `Мясо UI ${suffix}`);

        await createProductThroughUi(page, potato);
        await createProductThroughUi(page, water);
        await createProductThroughUi(page, meat);

        await productsPage.open();
        await productsPage.search(suffix);

        await productsPage.expectProductVisible(potato.name);
        await productsPage.expectProductVisible(water.name);
        await productsPage.expectProductVisible(meat.name);
    });

    /**
     * Проверяет, что форма продукта принимает валидные граничные значения.
     */
    test('accepts valid boundary values for product fields', async ({ page }) => {
        const suffix = Date.now().toString();

        const validProducts: ProductFormData[] = [
            productWithNutrition(`Аб ${suffix}`, '10', '1', '1', '1'),
            productWithNutrition(`Калории 0 ${suffix}`, productBoundaryValues.zeroNutrition, '1', '1', '1'),
            productWithNutrition(`Калории 001 ${suffix}`, productBoundaryValues.positiveNutritionNearBoundary, '1', '1', '1'),
            productWithNutrition(`Белки 0 ${suffix}`, '10', '0', '1', '1'),
            productWithNutrition(`Белки 100 ${suffix}`, '10', '100', '0', '0'),
            productWithNutrition(`Жиры 0 ${suffix}`, '10', '1', '0', '1'),
            productWithNutrition(`Жиры 100 ${suffix}`, '10', '0', '100', '0'),
            productWithNutrition(`Углеводы 0 ${suffix}`, '10', '1', '1', '0'),
            productWithNutrition(`Углеводы 100 ${suffix}`, '10', '0', '0', '100'),
            productWithNutrition(`БЖУ 100 ${suffix}`, '10', '60', '30', '10'),
            {
                ...productWithNutrition(`Фото 0 ${suffix}`, '10', '1', '1', '1'),
                photos: []
            },
            {
                ...productWithNutrition(`Фото 5 ${suffix}`, '10', '1', '1', '1'),
                photos: [
                    assetPath('kartoshqa.png'),
                    assetPath('svekla.png'),
                    assetPath('water.png'),
                    assetPath('meat.jpeg'),
                    assetPath('meat2.jpeg')
                ]
            }
        ];

        for (const product of validProducts) {
            await createProductThroughUi(page, product);
        }
    });

    /**
     * Проверяет, что UI не позволяет загрузить больше пяти фотографий продукта.
     */
    test('does not allow uploading more than five product photos', async ({ page }) => {
        const suffix = Date.now().toString();

        const productsPage = new ProductsPage(page);
        await productsPage.open();
        await productsPage.openCreatePage();

        const form = new ProductFormPage(page);

        await form.fillProduct({
            ...productWithNutrition(`Продукт с максимумом фото ${suffix}`, '10', '1', '1', '1'),
            photos: [
                assetPath('kartoshqa.png'),
                assetPath('svekla.png'),
                assetPath('water.png'),
                assetPath('meat.jpeg'),
                assetPath('meat2.jpeg')
            ]
        });

        await form.expectCannotUploadMoreThanFivePhotos(assetPath('borsch.png'));
    });

    /**
     * Проверяет, что форма продукта отклоняет невалидные граничные значения.
     */
    test('rejects invalid boundary values for product fields', async ({ page }) => {
        const suffix = Date.now().toString();

        const productsPage = new ProductsPage(page);

        const invalidProducts: ProductFormData[] = [
            productWithNutrition(productBoundaryValues.invalidNameEmpty, '10', '1', '1', '1'),
            productWithNutrition(productBoundaryValues.invalidNameOneChar, '10', '1', '1', '1'),
            productWithNutrition(`Калории -001 ${suffix}`, productBoundaryValues.invalidNegativeNutrition, '1', '1', '1'),
            productWithNutrition(`Белки -001 ${suffix}`, '10', productBoundaryValues.invalidNegativeNutrition, '1', '1'),
            productWithNutrition(`Белки 10001 ${suffix}`, '10', productBoundaryValues.invalidNutrientAboveMax, '0', '0'),
            productWithNutrition(`Жиры -001 ${suffix}`, '10', '1', productBoundaryValues.invalidNegativeNutrition, '1'),
            productWithNutrition(`Жиры 10001 ${suffix}`, '10', '0', productBoundaryValues.invalidNutrientAboveMax, '0'),
            productWithNutrition(`Углеводы -001 ${suffix}`, '10', '1', '1', productBoundaryValues.invalidNegativeNutrition),
            productWithNutrition(`Углеводы 10001 ${suffix}`, '10', '0', '0', productBoundaryValues.invalidNutrientAboveMax),
            productWithNutrition(`БЖУ больше 100 ${suffix}`, '10', '60', '30', '10.01')
        ];

        for (const product of invalidProducts) {
            await productsPage.open();
            await productsPage.openCreatePage();

            const form = new ProductFormPage(page);
            await form.fillProduct(product);
            await form.save();

            await expect(page.getByRole('heading', { name: 'Создание продукта' })).toBeVisible();
        }
    });

    /**
     * Проверяет бизнес-правило: мясной продукт не может иметь флаг "Веган".
     */
    test('does not allow vegan flag for meat product', async ({ page }) => {
        const suffix = Date.now().toString();

        const productsPage = new ProductsPage(page);
        await productsPage.open();
        await productsPage.openCreatePage();

        const form = new ProductFormPage(page);
        await form.fillProduct({
            ...products.meat,
            name: `Мясо веганское UI ${suffix}`,
            flags: []
        });

        await form.expectFlagDisabled('Веган');
    });

    /**
     * Проверяет поиск, фильтрацию и сортировку продуктов через UI.
     */
    test('filters, searches and sorts products through UI', async ({ page }) => {
        const suffix = Date.now().toString();

        const productsPage = new ProductsPage(page);

        const potato = withUniqueName(products.potato, `Картофель UI ${suffix}`);
        const beet = withUniqueName(products.beet, `Свёкла UI ${suffix}`);
        const water = withUniqueName(products.water, `Вода UI ${suffix}`);
        const meat = withUniqueName(products.meat, `Мясо UI ${suffix}`);

        await createProductThroughUi(page, potato);
        await createProductThroughUi(page, beet);
        await createProductThroughUi(page, water);
        await createProductThroughUi(page, meat);

        await productsPage.open();

        await productsPage.search(suffix);
        await productsPage.expectProductVisible(potato.name);
        await productsPage.expectProductVisible(beet.name);
        await productsPage.expectProductVisible(water.name);
        await productsPage.expectProductVisible(meat.name);

        await productsPage.selectCategory('Овощи');
        await productsPage.expectProductVisible(potato.name);
        await productsPage.expectProductVisible(beet.name);
        await productsPage.expectProductHidden(water.name);
        await productsPage.expectProductHidden(meat.name);

        await productsPage.resetFilters();
        await productsPage.search(suffix);
        await productsPage.checkFlagFilter('Веган');
        await productsPage.expectProductVisible(potato.name);
        await productsPage.expectProductVisible(beet.name);
        await productsPage.expectProductVisible(water.name);
        await productsPage.expectProductHidden(meat.name);

        await productsPage.resetFilters();
        await productsPage.search(suffix);
        await productsPage.selectCookingRequirement('Требует приготовления');
        await productsPage.expectProductVisible(potato.name);
        await productsPage.expectProductVisible(beet.name);
        await productsPage.expectProductVisible(meat.name);
        await productsPage.expectProductHidden(water.name);

        await productsPage.resetFilters();
        await productsPage.search(suffix);
        await productsPage.selectSort('Калорийность');
        await productsPage.selectDirection('По убыванию');

        const firstCard = page.locator('.card').first();
        await expect(firstCard).toContainText(meat.name);
    });

    /**
     * Проверяет редактирование продукта и просмотр обновлённых данных в карточке.
     */
    test('updates product and reads updated product details', async ({ page }) => {
        const suffix = Date.now().toString();

        const productsPage = new ProductsPage(page);

        const potato = withUniqueName(products.potato, `Картофель UI ${suffix}`);
        const updatedName = `Картофель очищенный UI ${suffix}`;

        await createProductThroughUi(page, potato);

        await productsPage.open();
        await productsPage.search(potato.name);
        await productsPage.editProduct(potato.name);

        const form = new ProductFormPage(page);
        await form.fillProduct({
            ...potato,
            name: updatedName,
            composition: 'Картофель очищенный свежий'
        });
        await form.save();

        const detailsPage = new ProductDetailsPage(page);
        await detailsPage.expectOpened();
        await detailsPage.expectName(updatedName);
        await detailsPage.expectText('Картофель очищенный свежий');
        await detailsPage.expectPhotoVisible();

        await productsPage.open();
        await productsPage.search(updatedName);
        await productsPage.expectProductVisible(updatedName);

        await productsPage.openProduct(updatedName);
        await detailsPage.expectOpened();
        await detailsPage.expectName(updatedName);
        await detailsPage.expectText('Картофель очищенный свежий');
    });
});