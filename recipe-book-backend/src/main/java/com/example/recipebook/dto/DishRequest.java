package com.example.recipebook.dto;

import com.example.recipebook.domain.enums.DietFlag;
import com.example.recipebook.domain.enums.DishCategory;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

public record DishRequest(
        @NotBlank @Size(min = 2, max = 255) String name,
        @Size(max = 5) List<@NotBlank String> photoUrls,
        @DecimalMin("0.00") BigDecimal calories,
        @DecimalMin("0.00") BigDecimal proteins,
        @DecimalMin("0.00") BigDecimal fats,
        @DecimalMin("0.00") BigDecimal carbohydrates,
        @NotNull @Size(min = 1) List<@Valid DishIngredientRequest> ingredients,
        @NotNull @DecimalMin(value = "0.00", inclusive = false) BigDecimal servingSizeGrams,
        DishCategory category,
        Set<DietFlag> flags
) {
}
