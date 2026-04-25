package com.example.recipebook.dto;

import com.example.recipebook.domain.enums.CookingRequirement;
import com.example.recipebook.domain.enums.DietFlag;
import com.example.recipebook.domain.enums.ProductCategory;
import java.time.Instant;
import java.util.List;
import java.util.Set;

public record ProductResponse(
        Long id,
        String name,
        List<String> photoUrls,
        NutritionDto nutrition,
        String composition,
        ProductCategory category,
        CookingRequirement cookingRequirement,
        Set<DietFlag> flags,
        Instant createdAt,
        Instant updatedAt
) {
}
