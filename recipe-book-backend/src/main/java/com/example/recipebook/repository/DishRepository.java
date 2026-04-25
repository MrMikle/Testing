package com.example.recipebook.repository;

import com.example.recipebook.domain.Dish;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DishRepository extends JpaRepository<Dish, Long>, JpaSpecificationExecutor<Dish> {
    @Query("select distinct d from Dish d join d.ingredients i where i.product.id = :productId order by d.name asc")
    List<Dish> findDishesUsingProduct(@Param("productId") Long productId);
}
