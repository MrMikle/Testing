package com.example.recipebook.domain;

import com.example.recipebook.domain.enums.DietFlag;
import com.example.recipebook.domain.enums.DishCategory;
import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "dishes")
public class Dish extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "dish_photos", joinColumns = @JoinColumn(name = "dish_id"))
    @Column(name = "photo_url", nullable = false, length = 2048)
    private List<String> photoUrls = new ArrayList<>();

    @Embedded
    private Nutrition nutrition;

    @OneToMany(mappedBy = "dish", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<DishIngredient> ingredients = new ArrayList<>();

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal servingSizeGrams;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private DishCategory category;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "dish_flags", joinColumns = @JoinColumn(name = "dish_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "flag", nullable = false, length = 50)
    private Set<DietFlag> flags = new HashSet<>();

    public Dish() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getPhotoUrls() {
        return photoUrls;
    }

    public void setPhotoUrls(List<String> photoUrls) {
        this.photoUrls.clear();
        if (photoUrls != null) {
            this.photoUrls.addAll(photoUrls);
        }
    }

    public Nutrition getNutrition() {
        return nutrition;
    }

    public void setNutrition(Nutrition nutrition) {
        this.nutrition = nutrition;
    }

    public List<DishIngredient> getIngredients() {
        return ingredients;
    }

    public void clearIngredients() {
        for (DishIngredient ingredient : ingredients) {
            ingredient.setDish(null);
        }
        ingredients.clear();
    }

    public void addIngredient(DishIngredient ingredient) {
        ingredient.setDish(this);
        ingredients.add(ingredient);
    }

    public BigDecimal getServingSizeGrams() {
        return servingSizeGrams;
    }

    public void setServingSizeGrams(BigDecimal servingSizeGrams) {
        this.servingSizeGrams = servingSizeGrams;
    }

    public DishCategory getCategory() {
        return category;
    }

    public void setCategory(DishCategory category) {
        this.category = category;
    }

    public Set<DietFlag> getFlags() {
        return flags;
    }

    public void setFlags(Set<DietFlag> flags) {
        this.flags.clear();
        if (flags != null) {
            this.flags.addAll(flags);
        }
    }
}
