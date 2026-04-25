package com.example.recipebook.service;

import com.example.recipebook.domain.Nutrition;
import com.example.recipebook.domain.Product;
import com.example.recipebook.dto.DishIngredientRequest;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface NutritionCalculator {
    Nutrition calculateForPortion(List<DishIngredientRequest> ingredients, Map<Long, Product> productsById);

    BigDecimal round(BigDecimal value);
}
