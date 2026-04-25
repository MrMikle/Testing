package com.example.recipebook.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.recipebook.domain.Nutrition;
import com.example.recipebook.domain.Product;
import com.example.recipebook.domain.enums.CookingRequirement;
import com.example.recipebook.domain.enums.DietFlag;
import com.example.recipebook.domain.enums.ProductCategory;
import com.example.recipebook.dto.DishIngredientRequest;
import com.example.recipebook.service.impl.NutritionCalculatorImpl;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

/**
 * Unit-тесты для проверки расчёта калорийности блюда методом анализа граничных значений.
 *
 * В тестах проверяются важные границы для формулы расчёта:
 * количество продукта около нуля, ровно 100 грамм, большое количество продукта,
 * а также значения на границе округления до двух знаков.
 *
 * Spring-контекст, база данных и моки не используются, потому что калькулятор
 * не зависит от внешних ресурсов. Перед каждым тестом создаётся новый экземпляр
 * NutritionCalculatorImpl.
 */
@DisplayName("NutritionCalculator: boundary value analysis")
class NutritionCalculatorBoundaryValueTest {
    private static final Long PRODUCT_ID = 1L;

    private NutritionCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new NutritionCalculatorImpl();
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("quantityBoundaryCases")
    @DisplayName("calculates calories correctly for boundary quantity values")
    void calculatesCaloriesForBoundaryQuantityValues(String caseName,
                                                     String productCalories,
                                                     String quantityGrams,
                                                     String expectedCalories) {
        Product product = productWithCalories(productCalories);

        Nutrition result = calculator.calculateForPortion(
                List.of(ingredient(quantityGrams)),
                Map.of(PRODUCT_ID, product)
        );

        assertThat(caseName).isNotBlank();
        assertThat(result.getCalories()).isEqualByComparingTo(expectedCalories);
        assertThat(result.getProteins()).isEqualByComparingTo("0.00");
        assertThat(result.getFats()).isEqualByComparingTo("0.00");
        assertThat(result.getCarbohydrates()).isEqualByComparingTo("0.00");
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("roundingBoundaryCases")
    @DisplayName("rounds calculated values to two decimal places using HALF_UP")
    void roundsCalculatedValuesToTwoDecimalPlaces(String caseName,
                                                  String productCalories,
                                                  String quantityGrams,
                                                  String expectedCalories) {
        Product product = productWithCalories(productCalories);

        Nutrition result = calculator.calculateForPortion(
                List.of(ingredient(quantityGrams)),
                Map.of(PRODUCT_ID, product)
        );

        assertThat(caseName).isNotBlank();
        assertThat(result.getCalories()).isEqualByComparingTo(expectedCalories);
    }

    static Stream<Arguments> quantityBoundaryCases() {
        return Stream.of(
                Arguments.of(
                        "minimum positive quantity close to lower boundary",
                        "100",
                        "0.01",
                        "0.01"
                ),
                Arguments.of(
                        "exactly 100 grams uses product value per 100 grams",
                        "100",
                        "100",
                        "100.00"
                ),
                Arguments.of(
                        "large quantity above typical portion scales linearly",
                        "100",
                        "1000",
                        "1000.00"
                )
        );
    }

    static Stream<Arguments> roundingBoundaryCases() {
        return Stream.of(
                Arguments.of(
                        "value below rounding half boundary rounds down",
                        "1",
                        "0.4",
                        "0.00"
                ),
                Arguments.of(
                        "value at rounding half boundary rounds up",
                        "1",
                        "0.5",
                        "0.01"
                )
        );
    }

    private static DishIngredientRequest ingredient(String quantityGrams) {
        return new DishIngredientRequest(PRODUCT_ID, new BigDecimal(quantityGrams));
    }

    private static Product productWithCalories(String calories) {
        return new Product(
                "Тестовый продукт",
                List.of(),
                new Nutrition(
                        new BigDecimal(calories),
                        BigDecimal.ZERO,
                        BigDecimal.ZERO,
                        BigDecimal.ZERO
                ),
                null,
                ProductCategory.VEGETABLES,
                CookingRequirement.READY_TO_EAT,
                Set.of(DietFlag.VEGAN, DietFlag.GLUTEN_FREE, DietFlag.SUGAR_FREE)
        );
    }
}