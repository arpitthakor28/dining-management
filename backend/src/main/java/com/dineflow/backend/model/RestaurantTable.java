package com.dineflow.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tables")
public class RestaurantTable {

    @Id
    private String id;

    @Column(name = "qr_code", unique = true)
    private String qrCode;

    @Column(name = "status")
    private String status = "Free";

    public RestaurantTable() {}

    public RestaurantTable(String id, String qrCode, String status) {
        this.id = id;
        this.qrCode = qrCode;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getQrCode() {
        return qrCode;
    }

    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
