package com.example.recipebook.service.impl;

import com.example.recipebook.domain.Nutrition;
import com.example.recipebook.domain.Product;
import com.example.recipebook.dto.DishIngredientRequest;
import com.example.recipebook.exception.BusinessRuleException;
import com.example.recipebook.service.NutritionCalculator;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class NutritionCalculatorImpl implements NutritionCalculator {
    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    @Override
    public Nutrition calculateForPortion(List<DishIngredientRequest> ingredients, Map<Long, Product> productsById) {
        ensureNoDuplicateProducts(ingredients);

        BigDecimal calories = BigDecimal.ZERO;
        BigDecimal proteins = BigDecimal.ZERO;
        BigDecimal fats = BigDecimal.ZERO;
        BigDecimal carbohydrates = BigDecimal.ZERO;

        for (DishIngredientRequest ingredient : ingredients) {
            Product product = productsById.get(ingredient.productId());
            if (product == null) {
                throw new BusinessRuleException("Product with id " + ingredient.productId() + " does not exist");
            }
            BigDecimal factor = ingredient.quantityGrams().divide(ONE_HUNDRED, 8, RoundingMode.HALF_UP);
            Nutrition productNutrition = product.getNutrition();
            calories = calories.add(productNutrition.getCalories().multiply(factor));
            proteins = proteins.add(productNutrition.getProteins().multiply(factor));
            fats = fats.add(productNutrition.getFats().multiply(factor));
            carbohydrates = carbohydrates.add(productNutrition.getCarbohydrates().multiply(factor));
        }

        return new Nutrition(round(calories), round(proteins), round(fats), round(carbohydrates));
    }

    @Override
    public BigDecimal round(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private void ensureNoDuplicateProducts(List<DishIngredientRequest> ingredients) {
        Set<Long> productIds = new HashSet<>();
        for (DishIngredientRequest ingredient : ingredients) {
            if (!productIds.add(ingredient.productId())) {
                throw new BusinessRuleException("Dish composition contains duplicate product id " + ingredient.productId());
            }
        }
    }
}
