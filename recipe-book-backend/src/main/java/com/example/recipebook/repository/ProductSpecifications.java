package com.example.recipebook.repository;

import com.example.recipebook.domain.Product;
import com.example.recipebook.domain.enums.CookingRequirement;
import com.example.recipebook.domain.enums.DietFlag;
import com.example.recipebook.domain.enums.ProductCategory;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

public final class ProductSpecifications {
    private ProductSpecifications() {
    }

    public static Specification<Product> category(ProductCategory category) {
        return category == null
                ? alwaysTrue()
                : (root, query, cb) -> cb.equal(root.get("category"), category);
    }

    public static Specification<Product> cookingRequirement(CookingRequirement cookingRequirement) {
        return cookingRequirement == null
                ? alwaysTrue()
                : (root, query, cb) -> cb.equal(root.get("cookingRequirement"), cookingRequirement);
    }

    public static Specification<Product> nameContains(String search) {
        if (search == null || search.isBlank()) {
            return alwaysTrue();
        }
        String pattern = "%" + search.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("name")), pattern);
    }

    public static Specification<Product> hasFlag(DietFlag flag) {
        return flag == null
                ? alwaysTrue()
                : (root, query, cb) -> {
            query.distinct(true);
            return cb.equal(root.join("flags", JoinType.INNER), flag);
        };
    }

    private static Specification<Product> alwaysTrue() {
        return (root, query, cb) -> cb.conjunction();
    }
}