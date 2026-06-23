package com.dineflow.backend.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.dineflow.backend.model.MenuItem;
import com.dineflow.backend.model.Order;
import com.dineflow.backend.model.RestaurantTable;
import com.dineflow.backend.repository.MenuItemRepository;
import com.dineflow.backend.repository.OrderRepository;
import com.dineflow.backend.repository.RestaurantTableRepository;
import com.dineflow.backend.service.SseService;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final RestaurantTableRepository tableRepository;
    private final MenuItemRepository menuItemRepository;
    private final SseService sseService;

    public OrderController(OrderRepository orderRepository,
                           RestaurantTableRepository tableRepository,
                           MenuItemRepository menuItemRepository,
                           SseService sseService) {
        this.orderRepository = orderRepository;
        this.tableRepository = tableRepository;
        this.menuItemRepository = menuItemRepository;
        this.sseService = sseService;
    }

    @GetMapping
    public List<Order> getOrders(@RequestParam(required = false) String tableId) {
        if (tableId != null && !tableId.trim().isEmpty()) {
            return orderRepository.findByTableIdOrderByTimestampDesc(tableId);
        } else {
            return orderRepository.findAllByOrderByTimestampDesc();
        }
    }

    @PostMapping
    @Transactional
    public List<Order> createOrders(@RequestBody List<OrderDto> orderDtos) {
        List<Order> savedOrders = new ArrayList<>();
        for (OrderDto dto : orderDtos) {
            RestaurantTable table = tableRepository.findById(dto.tableId())
                    .orElseGet(() -> tableRepository.save(new RestaurantTable(dto.tableId(), "QR-" + dto.tableId() + "-DEMO", "active")));
            
            MenuItem menuItem = menuItemRepository.findById(dto.itemId())
                    .orElseGet(() -> {
                        String name = dto.name() != null ? dto.name() : dto.itemId();
                        java.math.BigDecimal price = dto.price() != null 
                                ? java.math.BigDecimal.valueOf(dto.price()) 
                                : java.math.BigDecimal.ZERO;
                        return menuItemRepository.save(new MenuItem(dto.itemId(), name, price, "general", true));
                    });

            Order order = new Order(
                    dto.batchId(),
                    table,
                    menuItem,
                    dto.qty() != null ? dto.qty() : 1,
                    dto.status() != null ? dto.status() : "New",
                    dto.notes(),
                    LocalDateTime.now()
            );
            savedOrders.add(orderRepository.save(order));
        }
        
        // Broadcast the update event to all SSE subscribers
        sseService.broadcast("order_update", "created");
        return savedOrders;
    }

    @PutMapping("/batches/{batchId}/status")
    @Transactional
    public ResponseEntity<Void> updateBatchStatus(@PathVariable String batchId, @RequestParam String status) {
        List<Order> orders = orderRepository.findByBatchId(batchId);
        if (orders.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        for (Order order : orders) {
            order.setStatus(status);
            orderRepository.save(order);
        }
        
        // Broadcast the update event to all SSE subscribers
        sseService.broadcast("order_update", "status_changed");
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    @Transactional
    public ResponseEntity<Void> clearTableOrders(@RequestParam String tableId) {
        orderRepository.deleteByTableId(tableId);
        
        // Also ensure table is set back to Free
        tableRepository.findById(tableId).ifPresent(table -> {
            table.setStatus("Free");
            tableRepository.save(table);
            sseService.broadcast("table_update", table);
        });

        // Broadcast the update event to all SSE subscribers
        sseService.broadcast("order_update", "cleared");
        return ResponseEntity.ok().build();
    }

    // DTO to map JSON request payload
    public record OrderDto(
            @JsonProperty("batch_id") String batchId,
            @JsonProperty("table_id") String tableId,
            @JsonProperty("item_id") String itemId,
            String name,
            Double price,
            Integer qty,
            String status,
            String notes
    ) {}
}
