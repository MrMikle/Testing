package com.example.recipebook.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record DishNutritionCalculationRequest(
        @NotNull @Size(min = 1) List<@Valid DishIngredientRequest> ingredients
) {
}
