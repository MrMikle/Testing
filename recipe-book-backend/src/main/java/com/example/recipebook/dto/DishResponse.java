package com.example.recipebook.dto;

import com.example.recipebook.domain.enums.DietFlag;
import com.example.recipebook.domain.enums.DishCategory;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Set;

public record DishResponse(
        Long id,
        String name,
        List<String> photoUrls,
        NutritionDto nutrition,
        List<DishIngredientResponse> ingredients,
        BigDecimal servingSizeGrams,
        DishCategory category,
        Set<DietFlag> flags,
        Instant createdAt,
        Instant updatedAt
) {
}
