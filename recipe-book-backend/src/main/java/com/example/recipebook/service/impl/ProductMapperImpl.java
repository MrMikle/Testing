package com.example.recipebook.service.impl;

import com.example.recipebook.domain.Nutrition;
import com.example.recipebook.domain.Product;
import com.example.recipebook.dto.NutritionDto;
import com.example.recipebook.dto.ProductResponse;
import com.example.recipebook.service.ProductMapper;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class ProductMapperImpl implements ProductMapper {
    @Override
    public ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                List.copyOf(product.getPhotoUrls()),
                toNutritionDto(product.getNutrition()),
                product.getComposition(),
                product.getCategory(),
                product.getCookingRequirement(),
                Set.copyOf(product.getFlags()),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }

    @Override
    public NutritionDto toNutritionDto(Nutrition nutrition) {
        return new NutritionDto(
                nutrition.getCalories(),
                nutrition.getProteins(),
                nutrition.getFats(),
                nutrition.getCarbohydrates()
        );
    }
}
