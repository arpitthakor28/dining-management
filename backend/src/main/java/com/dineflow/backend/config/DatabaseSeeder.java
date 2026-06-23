package com.dineflow.backend.config;

import com.dineflow.backend.model.MenuItem;
import com.dineflow.backend.model.RestaurantTable;
import com.dineflow.backend.repository.MenuItemRepository;
import com.dineflow.backend.repository.RestaurantTableRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantTableRepository tableRepository;

    public DatabaseSeeder(MenuItemRepository menuItemRepository, RestaurantTableRepository tableRepository) {
        this.menuItemRepository = menuItemRepository;
        this.tableRepository = tableRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed Table 12
        if (tableRepository.findById("T-12").isEmpty()) {
            tableRepository.save(new RestaurantTable("T-12", "QR-T12-DEMO", "active"));
            System.out.println("Seeded Table T-12");
        }

        // Seed Menu Items
        if (menuItemRepository.count() == 0) {
            List<MenuItem> items = List.of(
                new MenuItem("lasaniya_dhokla", "Lasaniya Dhokla", new BigDecimal("320.00"), "kathiyawadi", true),
                new MenuItem("kathiyawadi_special", "Kathiyawadi Special", new BigDecimal("300.00"), "kathiyawadi", true),
                new MenuItem("sev_khamani", "Sev Khamani", new BigDecimal("280.00"), "kathiyawadi", true),
                new MenuItem("batata_vada", "Batata Vada", new BigDecimal("280.00"), "kathiyawadi", true),
                new MenuItem("kothimbir_vadi", "Kothimbir Vadi", new BigDecimal("280.00"), "kathiyawadi", true),
                new MenuItem("farali_sev_khaman", "Farali Sev Khaman", new BigDecimal("300.00"), "kathiyawadi", true),
                new MenuItem("dahi", "Dahi", new BigDecimal("150.00"), "kathiyawadi", true),
                new MenuItem("kadhi_bowl", "Kadhi Bowl", new BigDecimal("150.00"), "kathiyawadi", true),
                new MenuItem("masala_khaman_sev", "Masala Khaman (Sev)", new BigDecimal("210.00"), "kathiyawadi", true),
                new MenuItem("punjabi_khaman_sev", "Punjabi Khaman (Sev)", new BigDecimal("150.00"), "kathiyawadi", true),
                new MenuItem("vagharela_khaman", "Vagharela Khaman", new BigDecimal("80.00"), "kathiyawadi", true),
                new MenuItem("masala_khaman", "Masala Khaman", new BigDecimal("75.00"), "kathiyawadi", true),
                new MenuItem("pakoda_khaman", "Pakoda Khaman", new BigDecimal("80.00"), "kathiyawadi", true),
                new MenuItem("dahi_khaman", "Dahi Khaman", new BigDecimal("90.00"), "kathiyawadi", true),
                new MenuItem("dahi_tikhari", "Dahi Tikhari", new BigDecimal("90.00"), "kathiyawadi", true),
                new MenuItem("rotla_bhakhri", "Rotla (Bhakhri)", new BigDecimal("28.00"), "kathiyawadi", true),
                new MenuItem("lava_papad", "Lava Papad", new BigDecimal("28.00"), "kathiyawadi", true),
                new MenuItem("swami_roti", "Swami Roti", new BigDecimal("15.00"), "kathiyawadi", true),
                new MenuItem("math", "Math", new BigDecimal("20.00"), "kathiyawadi", true),
                new MenuItem("mix_vegetable", "Mix Vegetable", new BigDecimal("380.00"), "vegetables", true),
                new MenuItem("veg_handi", "Veg Handi", new BigDecimal("320.00"), "vegetables", true),
                new MenuItem("paneer_butter_masala", "Paneer Butter Masala", new BigDecimal("390.00"), "paneer", true),
                new MenuItem("plain_tandoori_roti", "Plain Tandoori Roti", new BigDecimal("35.00"), "tandoor", true),
                new MenuItem("butter_tandoori_roti", "Butter Tandoori Roti", new BigDecimal("40.00"), "tandoor", true),
                new MenuItem("garlic_naan", "Garlic Naan", new BigDecimal("45.00"), "tandoor", true),
                new MenuItem("buttermilk", "Buttermilk", new BigDecimal("20.00"), "beverages", true),
                new MenuItem("salted_papad", "Salted Papad", new BigDecimal("20.00"), "beverages", true),
                new MenuItem("fried_papad", "Fried Papad", new BigDecimal("30.00"), "beverages", true)
            );
            menuItemRepository.saveAll(items);
            System.out.println("Seeded " + items.size() + " menu items successfully.");
        }
    }
}
