import { expect, Page, test } from '@playwright/test';
import { DishFormData, ProductFormData, assetPath, dishBoundaryValues, dishes, products } from '../fixtures/testData';
import { createDishThroughUi, createProductThroughUi } from '../helpers/createEntities';
import { DishDetailsPage } from '../pages/DishDetailsPage';
import { DishFormPage } from '../pages/DishFormPage';
import { DishesPage } from '../pages/DishesPage';

/**
 * Системные UI-тесты раздела блюд.
 *
 * Проверяют создание блюд, расчёт и ручную корректировку КБЖУ,
 * граничные значения, загрузку фотографий, макросы категорий,
 * бизнес-правила флагов и редактирование состава через пользовательский интерфейс.
 */

function withUniqueProductName(product: ProductFormData, name: string): ProductFormData {
    return {
        ...product,
        name,
        photos: []
    };
}

function withUniqueDishData(dish: DishFormData, name: string): DishFormData {
    return {
        ...dish,
        name,
        photos: []
    };
}

async function createProductsForBorsch(page: Page, suffix: string) {
    const potato = withUniqueProductName(products.potato, `Картофель dish UI ${suffix}`);
    const beet = withUniqueProductName(products.beet, `Свёкла dish UI ${suffix}`);
    const water = withUniqueProductName(products.water, `Вода dish UI ${suffix}`);
    const meat = withUniqueProductName(products.meat, `Мясо dish UI ${suffix}`);

    await createProductThroughUi(page, potato);
    await createProductThroughUi(page, beet);
    await createProductThroughUi(page, water);
    await createProductThroughUi(page, meat);

    return {
        potato,
        beet,
        water,
        meat
    };
}

async function expectDishCreationRejected(page: Page, dish: DishFormData) {
    const dishesPage = new DishesPage(page);
    await dishesPage.open();
    await dishesPage.openCreatePage();

    const form = new DishFormPage(page);
    await form.fillDish(dish);
    await form.save();

    await expect(page.getByRole('heading', { name: 'Создание блюда' })).toBeVisible();
}

async function expectDishWithManualNutritionRejected(page: Page, dish: DishFormData) {
    const dishesPage = new DishesPage(page);
    await dishesPage.open();
    await dishesPage.openCreatePage();

    const form = new DishFormPage(page);
    await form.fillDish(dish);
    await form.fillManualNutrition(
        dish.calories ?? '',
        dish.proteins ?? '',
        dish.fats ?? '',
        dish.carbohydrates ?? ''
    );
    await form.save();

    await expect(page.getByRole('heading', { name: 'Создание блюда' })).toBeVisible();
}

function dishWithProducts(data: DishFormData, productNames: Record<string, string>): DishFormData {
    return {
        ...data,
        ingredients: data.ingredients.map((ingredient) => ({
            ...ingredient,
            productName: productNames[ingredient.productName] ?? ingredient.productName
        }))
    };
}

test.describe('Dish UI system tests', () => {
    /**
     * Проверяет расчёт КБЖУ по составу и сохранение ручной корректировки.
     */
    test('calculates nutrition and saves manually corrected nutrition through UI', async ({ page }) => {
        const suffix = Date.now().toString();
        const createdProducts = await createProductsForBorsch(page, suffix);

        const dish: DishFormData = {
            name: `Блюдо с ручным КБЖУ UI ${suffix}`,
            category: 'Суп',
            servingSizeGrams: '350',
            ingredients: [
                { productName: createdProducts.potato.name, quantityGrams: '100' },
                { productName: createdProducts.beet.name, quantityGrams: '150' },
                { productName: createdProducts.water.name, quantityGrams: '500' },
                { productName: createdProducts.meat.name, quantityGrams: '150' }
            ],
            flags: ['Без глютена', 'Без сахара'],
            photos: []
        };

        const dishesPage = new DishesPage(page);
        await dishesPage.open();
        await dishesPage.openCreatePage();

        const form = new DishFormPage(page);
        await form.fillDish(dish);
        await form.calculateNutrition();
        await form.expectNutritionFilled();

        await form.fillManualNutrition('80', '10', '5', '20');
        await form.save();

        const detailsPage = new DishDetailsPage(page);
        await detailsPage.expectOpened();
        await detailsPage.expectName(dish.name);
        await detailsPage.expectText('Ккал: 80');
        await detailsPage.expectText('Белки: 10');
        await detailsPage.expectText('Жиры: 5');
        await detailsPage.expectText('Углеводы: 20');
    });

    /**
     * Проверяет, что форма блюда принимает валидные граничные значения.
     */
    test('accepts valid boundary values for dish fields', async ({ page }) => {
        const suffix = Date.now().toString();
        const water = withUniqueProductName(products.water, `Вода valid dish boundaries ${suffix}`);
        await createProductThroughUi(page, water);

        const validDishes: DishFormData[] = [
            {
                name: `Аб ${suffix}`,
                category: 'Перекус',
                servingSizeGrams: '100',
                ingredients: [{ productName: water.name, quantityGrams: '100' }],
                photos: []
            },
            {
                name: `Фото 0 блюдо ${suffix}`,
                category: 'Перекус',
                servingSizeGrams: '100',
                ingredients: [{ productName: water.name, quantityGrams: '100' }],
                photos: []
            },
            {
                name: `Фото 5 блюдо ${suffix}`,
                category: 'Перекус',
                servingSizeGrams: '100',
                ingredients: [{ productName: water.name, quantityGrams: '100' }],
                photos: [
                    assetPath('kartoshqa.png'),
                    assetPath('svekla.png'),
                    assetPath('water.png'),
                    assetPath('meat.jpeg'),
                    assetPath('meat2.jpeg')
                ]
            },
            {
                name: `Порция граница ${suffix}`,
                category: 'Перекус',
                servingSizeGrams: dishBoundaryValues.validServingSizeNearBoundary,
                ingredients: [{ productName: water.name, quantityGrams: '100' }],
                photos: []
            },
            {
                name: `Количество граница ${suffix}`,
                category: 'Перекус',
                servingSizeGrams: '100',
                ingredients: [{ productName: water.name, quantityGrams: dishBoundaryValues.validIngredientQuantityNearBoundary }],
                photos: []
            },
            {
                name: `Нулевое ручное КБЖУ ${suffix}`,
                category: 'Перекус',
                servingSizeGrams: '100',
                ingredients: [{ productName: water.name, quantityGrams: '100' }],
                calories: '0',
                proteins: '0',
                fats: '0',
                carbohydrates: '0',
                photos: []
            }
        ];

        for (const dish of validDishes) {
            await createDishThroughUi(page, dish);
        }
    });

    /**
     * Проверяет, что UI не позволяет загрузить больше пяти фотографий блюда.
     */
    test('does not allow uploading more than five dish photos', async ({ page }) => {
        const suffix = Date.now().toString();

        const water = withUniqueProductName(products.water, `Вода dish photos ${suffix}`);
        await createProductThroughUi(page, water);

        const dishesPage = new DishesPage(page);
        await dishesPage.open();
        await dishesPage.openCreatePage();

        const form = new DishFormPage(page);

        await form.fillDish({
            name: `Блюдо с максимумом фото ${suffix}`,
            category: 'Перекус',
            servingSizeGrams: '100',
            ingredients: [{ productName: water.name, quantityGrams: '100' }],
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
     * Проверяет, что форма блюда отклоняет базовые невалидные граничные значения.
     */
    test('rejects invalid boundary values for basic dish fields', async ({ page }) => {
        const suffix = Date.now().toString();
        const water = withUniqueProductName(products.water, `Вода invalid dish boundaries ${suffix}`);
        await createProductThroughUi(page, water);

        const invalidDishes: DishFormData[] = [
            {
                name: dishBoundaryValues.invalidNameEmpty,
                category: 'Перекус',
                servingSizeGrams: '100',
                ingredients: [{ productName: water.name, quantityGrams: '100' }],
                photos: []
            },
            {
                name: dishBoundaryValues.invalidNameOneChar,
                category: 'Перекус',
                servingSizeGrams: '100',
                ingredients: [{ productName: water.name, quantityGrams: '100' }],
                photos: []
            },
            {
                name: `Порция 0 ${suffix}`,
                category: 'Перекус',
                servingSizeGrams: dishBoundaryValues.invalidZeroServingSize,
                ingredients: [{ productName: water.name, quantityGrams: '100' }],
                photos: []
            },
            {
                name: `Количество 0 ${suffix}`,
                category: 'Перекус',
                servingSizeGrams: '100',
                ingredients: [{ productName: water.name, quantityGrams: dishBoundaryValues.invalidZeroIngredientQuantity }],
                photos: []
            }
        ];

        for (const dish of invalidDishes) {
            await expectDishCreationRejected(page, dish);
        }
    });

    /**
     * Проверяет, что блюдо без ингредиентов не создаётся.
     */
    test('rejects dish without ingredients', async ({ page }) => {
        const suffix = Date.now().toString();

        const dishesPage = new DishesPage(page);
        await dishesPage.open();
        await dishesPage.openCreatePage();

        const form = new DishFormPage(page);
        await form.fillName(`Пустой состав ${suffix}`);
        await form.selectCategory('Перекус');
        await form.fillServingSize('100');
        await form.save();

        await expect(page.getByRole('heading', { name: 'Создание блюда' })).toBeVisible();
    });

    /**
     * Проверяет, что форма блюда отклоняет невалидное ручное КБЖУ.
     */
    test('rejects invalid manual nutrition boundary values for dish', async ({ page }) => {
        const suffix = Date.now().toString();
        const water = withUniqueProductName(products.water, `Вода invalid manual nutrition ${suffix}`);
        await createProductThroughUi(page, water);

        const invalidDishes: DishFormData[] = [
            {
                name: `Минус калории ${suffix}`,
                category: 'Перекус',
                servingSizeGrams: '100',
                ingredients: [{ productName: water.name, quantityGrams: '100' }],
                calories: dishBoundaryValues.invalidNegativeNutrition,
                proteins: '0',
                fats: '0',
                carbohydrates: '0',
                photos: []
            },
            {
                name: `Минус белки ${suffix}`,
                category: 'Перекус',
                servingSizeGrams: '100',
                ingredients: [{ productName: water.name, quantityGrams: '100' }],
                calories: '0',
                proteins: dishBoundaryValues.invalidNegativeNutrition,
                fats: '0',
                carbohydrates: '0',
                photos: []
            },
            {
                name: `Минус жиры ${suffix}`,
                category: 'Перекус',
                servingSizeGrams: '100',
                ingredients: [{ productName: water.name, quantityGrams: '100' }],
                calories: '0',
                proteins: '0',
                fats: dishBoundaryValues.invalidNegativeNutrition,
                carbohydrates: '0',
                photos: []
            },
            {
                name: `Минус углеводы ${suffix}`,
                category: 'Перекус',
                servingSizeGrams: '100',
                ingredients: [{ productName: water.name, quantityGrams: '100' }],
                calories: '0',
                proteins: '0',
                fats: '0',
                carbohydrates: dishBoundaryValues.invalidNegativeNutrition,
                photos: []
            },
            {
                name: `БЖУ больше 100 ${suffix}`,
                category: 'Перекус',
                servingSizeGrams: '100',
                ingredients: [{ productName: water.name, quantityGrams: '100' }],
                calories: '100',
                proteins: '60',
                fats: '30',
                carbohydrates: '10.01',
                photos: []
            }
        ];

        for (const dish of invalidDishes) {
            await expectDishWithManualNutritionRejected(page, dish);
        }
    });

    /**
     * Проверяет автоматическое определение категории блюда по макросу в названии.
     */
    test('uses macro category when form category is empty', async ({ page }) => {
        const suffix = Date.now().toString();
        const createdProducts = await createProductsForBorsch(page, suffix);

        const dish = withUniqueDishData(
            dishWithProducts(dishes.veganBorsch, {
                Картофель: createdProducts.potato.name,
                Свёкла: createdProducts.beet.name,
                Вода: createdProducts.water.name
            }),
            `!суп Борщ веганский macro UI ${suffix}`
        );

        await createDishThroughUi(page, dish);

        const detailsPage = new DishDetailsPage(page);
        await detailsPage.expectText('Суп');
        await detailsPage.expectName(`Борщ веганский macro UI ${suffix}`);
    });

    /**
     * Проверяет, что категория из поля формы имеет приоритет над макросом.
     */
    test('uses form category instead of macro category', async ({ page }) => {
        const suffix = Date.now().toString();
        const createdProducts = await createProductsForBorsch(page, suffix);

        const dish = withUniqueDishData(
            dishWithProducts(dishes.borsch, {
                Картофель: createdProducts.potato.name,
                Свёкла: createdProducts.beet.name,
                Вода: createdProducts.water.name,
                Мясо: createdProducts.meat.name
            }),
            `!суп Борщ form category UI ${suffix}`
        );

        await createDishThroughUi(page, dish);

        const detailsPage = new DishDetailsPage(page);
        await detailsPage.expectText('Первое');
        await detailsPage.expectName(`Борщ form category UI ${suffix}`);
    });

    /**
     * Проверяет, что блюдо с мясом не может иметь флаг "Веган".
     */
    test('does not allow vegan flag for dish with meat', async ({ page }) => {
        const suffix = Date.now().toString();
        const meat = withUniqueProductName(products.meat, `Мясо dish flag UI ${suffix}`);
        await createProductThroughUi(page, meat);

        const dishesPage = new DishesPage(page);
        await dishesPage.open();
        await dishesPage.openCreatePage();

        const form = new DishFormPage(page);
        await form.fillName(`Блюдо с мясом UI ${suffix}`);
        await form.selectCategory('Второе');
        await form.fillServingSize('100');
        await form.selectIngredient(0, meat.name);
        await form.fillIngredientQuantity(0, '100');

        await form.expectFlagDisabled('Веган');
    });

    /**
     * Проверяет автоматическое снятие недоступного флага после изменения состава блюда.
     */
    test('removes unavailable vegan flag after dish composition update', async ({ page }) => {
        const suffix = Date.now().toString();
        const createdProducts = await createProductsForBorsch(page, suffix);

        const veganDish = withUniqueDishData(
            dishWithProducts(dishes.veganBorsch, {
                Картофель: createdProducts.potato.name,
                Свёкла: createdProducts.beet.name,
                Вода: createdProducts.water.name
            }),
            `!суп Борщ веганский flags UI ${suffix}`
        );

        await createDishThroughUi(page, veganDish);

        const detailsPage = new DishDetailsPage(page);
        await detailsPage.openEditPage();

        const form = new DishFormPage(page);
        await form.addIngredient();
        await form.selectIngredient(3, createdProducts.meat.name);
        await form.fillIngredientQuantity(3, '100');
        await form.expectFlagDisabled('Веган');
        await form.save();

        await detailsPage.expectOpened();
        await expect(page.locator('.chips')).not.toContainText('Веган');
        await expect(page.locator('.chips')).toContainText('Без глютена');
        await expect(page.locator('.chips')).toContainText('Без сахара');
    });
});