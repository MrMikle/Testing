package com.example.recipebook.domain;

import com.example.recipebook.domain.enums.CookingRequirement;
import com.example.recipebook.domain.enums.DietFlag;
import com.example.recipebook.domain.enums.ProductCategory;
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
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "products")
public class Product extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "product_photos", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "photo_url", nullable = false, length = 2048)
    private List<String> photoUrls = new ArrayList<>();

    @Embedded
    private Nutrition nutrition;

    @Column(columnDefinition = "text")
    private String composition;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ProductCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CookingRequirement cookingRequirement;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "product_flags", joinColumns = @JoinColumn(name = "product_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "flag", nullable = false, length = 50)
    private Set<DietFlag> flags = new HashSet<>();

    protected Product() {
    }

    public Product(String name,
                   List<String> photoUrls,
                   Nutrition nutrition,
                   String composition,
                   ProductCategory category,
                   CookingRequirement cookingRequirement,
                   Set<DietFlag> flags) {
        this.name = name;
        this.photoUrls = new ArrayList<>(photoUrls == null ? List.of() : photoUrls);
        this.nutrition = nutrition;
        this.composition = composition;
        this.category = category;
        this.cookingRequirement = cookingRequirement;
        this.flags = new HashSet<>(flags == null ? Set.of() : flags);
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

    public String getComposition() {
        return composition;
    }

    public void setComposition(String composition) {
        this.composition = composition;
    }

    public ProductCategory getCategory() {
        return category;
    }

    public void setCategory(ProductCategory category) {
        this.category = category;
    }

    public CookingRequirement getCookingRequirement() {
        return cookingRequirement;
    }

    public void setCookingRequirement(CookingRequirement cookingRequirement) {
        this.cookingRequirement = cookingRequirement;
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
