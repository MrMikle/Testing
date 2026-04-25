package com.example.recipebook.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.math.BigDecimal;
import java.util.Objects;

@Embeddable
public class Nutrition {
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal calories;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal proteins;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal fats;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal carbohydrates;

    protected Nutrition() {
    }

    public Nutrition(BigDecimal calories, BigDecimal proteins, BigDecimal fats, BigDecimal carbohydrates) {
        this.calories = Objects.requireNonNull(calories);
        this.proteins = Objects.requireNonNull(proteins);
        this.fats = Objects.requireNonNull(fats);
        this.carbohydrates = Objects.requireNonNull(carbohydrates);
    }

    public BigDecimal getCalories() {
        return calories;
    }

    public void setCalories(BigDecimal calories) {
        this.calories = calories;
    }

    public BigDecimal getProteins() {
        return proteins;
    }

    public void setProteins(BigDecimal proteins) {
        this.proteins = proteins;
    }

    public BigDecimal getFats() {
        return fats;
    }

    public void setFats(BigDecimal fats) {
        this.fats = fats;
    }

    public BigDecimal getCarbohydrates() {
        return carbohydrates;
    }

    public void setCarbohydrates(BigDecimal carbohydrates) {
        this.carbohydrates = carbohydrates;
    }
}
