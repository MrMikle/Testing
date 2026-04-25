package com.example.recipebook.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.recipebook.domain.Nutrition;
import com.example.recipebook.domain.Product;
import com.example.recipebook.domain.enums.CookingRequirement;
import com.example.recipebook.domain.enums.DietFlag;
import com.example.recipebook.domain.enums.ProductCategory;
import com.example.recipebook.dto.DishIngredientRequest;
import com.example.recipebook.exception.BusinessRuleException;
import com.example.recipebook.service.impl.NutritionCalculatorImpl;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

/**
 * Unit-тесты для проверки расчёта КБЖУ блюда методом эквивалентного разбиения.
 *
 * В тестах проверяются разные группы входных данных:
 * валидное блюдо из одного продукта, валидное блюдо из нескольких продуктов,
 * продукт с нулевым КБЖУ, отсутствующий продукт и повторяющийся продукт в составе.
 *
 * Spring-контекст и база данных не используются, потому что проверяется только
 * логика класса NutritionCalculatorImpl. Продукты создаются вручную как тестовые заглушки.
 */
@DisplayName("NutritionCalculator: equivalence partitioning")
class NutritionCalculatorEquivalencePartitioningTest {
    private NutritionCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new NutritionCalculatorImpl();
    }

    @Nested
    @DisplayName("Valid equivalence classes")
    class ValidEquivalenceClasses {
        @ParameterizedTest(name = "{0}")
        @MethodSource("com.example.recipebook.service.NutritionCalculatorEquivalencePartitioningTest#validCalculationCases")
        @DisplayName("calculates nutrition for valid dish compositions")
        void calculatesNutritionForValidDishCompositions(String caseName,
                                                         List<DishIngredientRequest> ingredients,
                                                         Map<Long, Product> productsById,
                                                         String expectedCalories,
                                                         String expectedProteins,
                                                         String expectedFats,
                                                         String expectedCarbohydrates) {
            Nutrition result = calculator.calculateForPortion(ingredients, productsById);

            assertNutrition(
                    result,
                    expectedCalories,
                    expectedProteins,
                    expectedFats,
                    expectedCarbohydrates
            );
        }
    }

    @Nested
    @DisplayName("Invalid equivalence classes")
    class InvalidEquivalenceClasses {
        @Test
        @DisplayName("throws exception when ingredient references product that does not exist")
        void throwsExceptionWhenProductIsMissing() {
            List<DishIngredientRequest> ingredients = List.of(
                    ingredient(999L, "100")
            );

            assertThatThrownBy(() -> calculator.calculateForPortion(ingredients, Map.of()))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("Product with id 999 does not exist");
        }

        @Test
        @DisplayName("throws exception when dish composition contains duplicate product ids")
        void throwsExceptionWhenDishCompositionContainsDuplicateProductIds() {
            Product potato = product("Картофель", "77", "2", "0.4", "16.3");

            List<DishIngredientRequest> ingredients = List.of(
                    ingredient(1L, "100"),
                    ingredient(1L, "50")
            );

            assertThatThrownBy(() -> calculator.calculateForPortion(ingredients, Map.of(1L, potato)))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("duplicate product id 1");
        }
    }

    static Stream<Arguments> validCalculationCases() {
        Product potato = product("Картофель", "77", "2", "0.4", "16.3");
        Product beet = product("Свёкла", "43", "1.6", "0.2", "9.6");
        Product water = product("Вода", "0", "0", "0", "0");
        Product meat = product("Мясо", "187.2", "18.9", "12.4", "0");

        return Stream.of(
                Arguments.of(
                        "one product with 100 grams returns product nutrition per 100 grams",
                        List.of(ingredient(1L, "100")),
                        Map.of(1L, potato),
                        "77.00",
                        "2.00",
                        "0.40",
                        "16.30"
                ),
                Arguments.of(
                        "several products calculate ordinary borsch nutrition",
                        List.of(
                                ingredient(1L, "100"),
                                ingredient(2L, "150"),
                                ingredient(3L, "500"),
                                ingredient(4L, "150")
                        ),
                        Map.of(
                                1L, potato,
                                2L, beet,
                                3L, water,
                                4L, meat
                        ),
                        "422.30",
                        "32.75",
                        "19.30",
                        "30.70"
                ),
                Arguments.of(
                        "zero-nutrition product returns zero nutrition",
                        List.of(ingredient(3L, "500")),
                        Map.of(3L, water),
                        "0.00",
                        "0.00",
                        "0.00",
                        "0.00"
                )
        );
    }

    private static DishIngredientRequest ingredient(Long productId, String quantityGrams) {
        return new DishIngredientRequest(productId, new BigDecimal(quantityGrams));
    }

    private static Product product(String name,
                                   String calories,
                                   String proteins,
                                   String fats,
                                   String carbohydrates) {
        return new Product(
                name,
                List.of(),
                new Nutrition(
                        new BigDecimal(calories),
                        new BigDecimal(proteins),
                        new BigDecimal(fats),
                        new BigDecimal(carbohydrates)
                ),
                null,
                ProductCategory.VEGETABLES,
                CookingRequirement.READY_TO_EAT,
                Set.of(DietFlag.VEGAN, DietFlag.GLUTEN_FREE, DietFlag.SUGAR_FREE)
        );
    }

    private static void assertNutrition(Nutrition result,
                                        String expectedCalories,
                                        String expectedProteins,
                                        String expectedFats,
                                        String expectedCarbohydrates) {
        assertThat(result.getCalories()).isEqualByComparingTo(expectedCalories);
        assertThat(result.getProteins()).isEqualByComparingTo(expectedProteins);
        assertThat(result.getFats()).isEqualByComparingTo(expectedFats);
        assertThat(result.getCarbohydrates()).isEqualByComparingTo(expectedCarbohydrates);
    }
}