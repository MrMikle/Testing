package com.example.recipebook.service;

import com.example.recipebook.domain.Nutrition;
import com.example.recipebook.domain.Product;
import com.example.recipebook.dto.NutritionDto;
import com.example.recipebook.dto.ProductResponse;

public interface ProductMapper {
    ProductResponse toResponse(Product product);

    NutritionDto toNutritionDto(Nutrition nutrition);
}
