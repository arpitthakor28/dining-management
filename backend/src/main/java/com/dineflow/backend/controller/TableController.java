package com.dineflow.backend.controller;

import com.dineflow.backend.model.RestaurantTable;
import com.dineflow.backend.repository.RestaurantTableRepository;
import com.dineflow.backend.service.SseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
public class TableController {

    private final RestaurantTableRepository tableRepository;
    private final SseService sseService;

    public TableController(RestaurantTableRepository tableRepository, SseService sseService) {
        this.tableRepository = tableRepository;
        this.sseService = sseService;
    }

    @GetMapping
    public List<RestaurantTable> getAllTables() {
        return tableRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantTable> getTable(@PathVariable String id) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseGet(() -> tableRepository.save(new RestaurantTable(id, "QR-" + id + "-DEMO", "active")));
        return ResponseEntity.ok(table);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantTable> updateTableStatus(@PathVariable String id, @RequestBody RestaurantTable updatedTable) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseGet(() -> new RestaurantTable(id, "QR-" + id + "-DEMO", "active"));
        table.setStatus(updatedTable.getStatus());
        RestaurantTable saved = tableRepository.save(table);
        sseService.broadcast("table_update", saved);
        return ResponseEntity.ok(saved);
    }
}
