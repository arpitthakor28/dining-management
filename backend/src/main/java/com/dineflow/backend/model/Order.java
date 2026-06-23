package com.dineflow.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "batch_id", nullable = false)
    private String batchId;

    @ManyToOne
    @JoinColumn(name = "table_id", referencedColumnName = "id")
    private RestaurantTable table;

    @ManyToOne
    @JoinColumn(name = "item_id", referencedColumnName = "id")
    private MenuItem menuItem;

    @Column(nullable = false)
    private Integer qty = 1;

    @Column(nullable = false)
    private String status = "New";

    private String notes;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public Order() {}

    public Order(String batchId, RestaurantTable table, MenuItem menuItem, Integer qty, String status, String notes, LocalDateTime timestamp) {
        this.batchId = batchId;
        this.table = table;
        this.menuItem = menuItem;
        this.qty = qty;
        this.status = status;
        this.notes = notes;
        this.timestamp = timestamp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBatchId() {
        return batchId;
    }

    public void setBatchId(String batchId) {
        this.batchId = batchId;
    }

    public RestaurantTable getTable() {
        return table;
    }

    public void setTable(RestaurantTable table) {
        this.table = table;
    }

    public MenuItem getMenuItem() {
        return menuItem;
    }

    public void setMenuItem(MenuItem menuItem) {
        this.menuItem = menuItem;
    }

    public Integer getQty() {
        return qty;
    }

    public void setQty(Integer qty) {
        this.qty = qty;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
