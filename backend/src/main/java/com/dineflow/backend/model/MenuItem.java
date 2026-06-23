package com.dineflow.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "menu_items")
public class MenuItem {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "kitchen_station")
    private String kitchenStation;

    private boolean available = true;

    public MenuItem() {}

    public MenuItem(String id, String name, BigDecimal price, String kitchenStation, boolean available) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.kitchenStation = kitchenStation;
        this.available = available;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getKitchenStation() {
        return kitchenStation;
    }

    public void setKitchenStation(String kitchenStation) {
        this.kitchenStation = kitchenStation;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }
}
