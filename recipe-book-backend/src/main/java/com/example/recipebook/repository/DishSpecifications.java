package com.example.recipebook.repository;

import com.example.recipebook.domain.Dish;
import com.example.recipebook.domain.enums.DietFlag;
import com.example.recipebook.domain.enums.DishCategory;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

public final class DishSpecifications {
    private DishSpecifications() {
    }

    public static Specification<Dish> category(DishCategory category) {
        return category == null
                ? alwaysTrue()
                : (root, query, cb) -> cb.equal(root.get("category"), category);
    }

    public static Specification<Dish> nameContains(String search) {
        if (search == null || search.isBlank()) {
            return alwaysTrue();
        }
        String pattern = "%" + search.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("name")), pattern);
    }

    public static Specification<Dish> hasFlag(DietFlag flag) {
        return flag == null
                ? alwaysTrue()
                : (root, query, cb) -> {
            query.distinct(true);
            return cb.equal(root.join("flags", JoinType.INNER), flag);
        };
    }

    private static Specification<Dish> alwaysTrue() {
        return (root, query, cb) -> cb.conjunction();
    }
}