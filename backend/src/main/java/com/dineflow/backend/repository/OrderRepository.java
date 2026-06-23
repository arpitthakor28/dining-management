package com.dineflow.backend.repository;

import com.dineflow.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByTableId(String tableId);
    List<Order> findByTableIdOrderByTimestampDesc(String tableId);
    List<Order> findByBatchId(String batchId);
    void deleteByTableId(String tableId);
    List<Order> findAllByOrderByTimestampDesc();
}
