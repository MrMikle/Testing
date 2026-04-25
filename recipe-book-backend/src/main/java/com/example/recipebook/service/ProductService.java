package com.example.recipebook.service;

import com.example.recipebook.domain.enums.CookingRequirement;
import com.example.recipebook.domain.enums.ProductCategory;
import com.example.recipebook.dto.ProductRequest;
import com.example.recipebook.dto.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    Page<ProductResponse> findAll(ProductCategory category,
                                  CookingRequirement cookingRequirement,
                                  Boolean vegan,
                                  Boolean glutenFree,
                                  Boolean sugarFree,
                                  String search,
                                  Pageable pageable);

    ProductResponse findById(Long id);

    ProductResponse create(ProductRequest request);

    ProductResponse update(Long id, ProductRequest request);

    void delete(Long id);
}
