import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AsyncLocalStorage } from 'async_hooks';

export const managerStorage = new AsyncLocalStorage();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'dineflow-db.json');

function checkAndInitializeRestaurantData(restaurantId, name) {
  if (!restaurantId) return;
  const data = readDb();
  
  if (name === 'tables') {
    const restaurantTables = (data.tables || []).filter(t => t.restaurant_id === restaurantId);
    if (restaurantTables.length === 0) {
      const defaultTables = [
        { id: 'T-1', table_number: '1', qr_code_token: '5a2b8e9c1f7d', status: 'empty', current_session_id: null, connected_device_id: null },
        { id: 'T-2', table_number: '2', qr_code_token: '9c3f1d8e7b6a', status: 'empty', current_session_id: null, connected_device_id: null },
        { id: 'T-3', table_number: '3', qr_code_token: '1e8d7c6b5a4f', status: 'empty', current_session_id: null, connected_device_id: null },
        { id: 'T-4', table_number: '4', qr_code_token: 'b6a5f4e3d2c1', status: 'empty', current_session_id: null, connected_device_id: null },
        { id: 'T-5', table_number: '5', qr_code_token: 'f3e2d1c0b9a8', status: 'empty', current_session_id: null, connected_device_id: null }
      ];
      defaultTables.forEach(t => {
        t.restaurant_id = restaurantId;
      });
      data.tables = (data.tables || []).concat(defaultTables);
      writeDb(data);
    }
  }
  
  if (name === 'menu_items' || name === 'menuItems') {
    const restaurantMenu = (data.menu_items || []).filter(m => m.restaurant_id === restaurantId);
    if (restaurantMenu.length === 0) {
      const defaultMenu = [
        { id: "lasaniya_dhokla", name: "Lasaniya Dhokla", price: 320, category: "Kathiyawadi", available: true },
        { id: "kathiyawadi_special", name: "Kathiyawadi Special", price: 300, category: "Kathiyawadi", available: true },
        { id: "sev_khamani", name: "Sev Khamani", price: 280, category: "Kathiyawadi", available: true },
        { id: "batata_vada", name: "Batata Vada", price: 280, category: "Kathiyawadi", available: true },
        { id: "kothimbir_vadi", name: "Kothimbir Vadi", price: 280, category: "Kathiyawadi", available: true },
        { id: "farali_sev_khaman", name: "Farali Sev Khaman", price: 300, category: "Kathiyawadi", available: true },
        { id: "dahi", name: "Dahi", price: 150, category: "Kathiyawadi", available: true },
        { id: "kadhi_bowl", name: "Kadhi Bowl", price: 150, category: "Kathiyawadi", available: true },
        { id: "masala_khaman_sev", name: "Masala Khaman (Sev)", price: 210, category: "Kathiyawadi", available: true },
        { id: "punjabi_khaman_sev", name: "Punjabi Khaman (Sev)", price: 150, category: "Kathiyawadi", available: true },
        { id: "vagharela_khaman", name: "Vagharela Khaman", price: 80, category: "Kathiyawadi", available: true },
        { id: "masala_khaman", name: "Masala Khaman", price: 75, category: "Kathiyawadi", available: true },
        { id: "pakoda_khaman", name: "Pakoda Khaman", price: 80, category: "Kathiyawadi", available: true },
        { id: "dahi_khaman", name: "Dahi Khaman", price: 90, category: "Kathiyawadi", available: true },
        { id: "dahi_tikhari", name: "Dahi Tikhari", price: 90, category: "Kathiyawadi", available: true },
        { id: "rotla_bhakhri", name: "Rotla (Bhakhri)", price: 28, category: "Kathiyawadi", available: true },
        { id: "lava_papad", name: "Lava Papad", price: 28, category: "Kathiyawadi", available: true },
        { id: "swami_roti", name: "Swami Roti", price: 15, category: "Kathiyawadi", available: true },
        { id: "math", name: "Math", price: 20, category: "Kathiyawadi", available: true },
        { id: "kathiyawadi_roti_khaman", name: "Kathiyawadi Roti Khaman", price: 388, category: "Kathiyawadi Special", available: true },
        { id: "kathiyawadi_special_combo", name: "Kathiyawadi Special Combo", price: 300, category: "Kathiyawadi Special", available: true },
        { id: "sev_chaas_dhokli_combo", name: "Sev Chaas Dhokli Combo", price: 320, category: "Kathiyawadi Special", available: true },
        { id: "methi_gota_sev_combo", name: "Methi Gota Sev Combo", price: 380, category: "Kathiyawadi Special", available: true },
        { id: "dry_bhaji", name: "Dry Bhaji", price: 300, category: "Kathiyawadi Special", available: true },
        { id: "lilva_papad", name: "Lilva Papad", price: 340, category: "Kathiyawadi Special", available: true },
        { id: "masala_aloo", name: "Masala Aloo", price: 260, category: "Kathiyawadi Special", available: true },
        { id: "lilva_methi_vada", name: "Lilva Methi Vada", price: 320, category: "Kathiyawadi Special", available: true },
        { id: "gunda_achar", name: "Gunda Achar", price: 320, category: "Kathiyawadi Special", available: true },
        { id: "rasawala_gunda_bateta", name: "Rasawala Gunda Bateta", price: 323, category: "Kathiyawadi Special", available: true },
        { id: "lilva_sev_khaman", name: "Lilva Sev Khaman", price: 320, category: "Kathiyawadi Special", available: true },
        { id: "bateta_sev_kathiyawadi", name: "Bateta Sev Kathiyawadi", price: 320, category: "Kathiyawadi Special", available: true },
        { id: "lilva_gunda_bateta", name: "Lilva Gunda Bateta", price: 323, category: "Kathiyawadi Special", available: true },
        { id: "methi_masala", name: "Methi Masala", price: 320, category: "Kathiyawadi Special", available: true },
        { id: "lilva_rasawala_moria", name: "Lilva Rasawala Moria", price: 320, category: "Kathiyawadi Special", available: true },
        { id: "kaju_kari", name: "Kaju Kari", price: 470, category: "Kaju", available: true },
        { id: "kaju_paneer", name: "Kaju Paneer", price: 470, category: "Kaju", available: true },
        { id: "kaju_masala", name: "Kaju Masala", price: 480, category: "Kaju", available: true },
        { id: "kaju_curry", name: "Kaju Curry", price: 480, category: "Kaju", available: true },
        { id: "kaju_mutter_masala", name: "Kaju Mutter Masala", price: 480, category: "Kaju", available: true },
        { id: "kaju_butter_curry", name: "Kaju Butter Curry", price: 480, category: "Kaju", available: true },
        { id: "kaju_butter_masala", name: "Kaju Butter Masala", price: 518, category: "Kaju", available: true },
        { id: "kaju_kadhai", name: "Kaju Kadhai", price: 518, category: "Kaju", available: true },
        { id: "kaju_handi", name: "Kaju Handi", price: 530, category: "Kaju", available: true },
        { id: "veg_handi", name: "Veg Handi", price: 320, category: "Vegetables", available: true },
        { id: "veg_kadhai", name: "Veg Kadhai", price: 360, category: "Vegetables", available: true },
        { id: "veg_kolhapuri", name: "Veg Kolhapuri", price: 350, category: "Vegetables", available: true },
        { id: "veg_hyderabadi", name: "Veg Hyderabadi", price: 370, category: "Vegetables", available: true },
        { id: "veg_jaipuri", name: "Veg Jaipuri", price: 350, category: "Vegetables", available: true },
        { id: "veg_tawa_masala", name: "Veg Tawa Masala", price: 370, category: "Vegetables", available: true },
        { id: "veg_chatpata", name: "Veg Chatpata", price: 380, category: "Vegetables", available: true },
        { id: "veg_makhanwala", name: "Veg Makhanwala", price: 380, category: "Vegetables", available: true },
        { id: "veg_kaju_masala", name: "Veg Kaju Masala", price: 380, category: "Vegetables", available: true },
        { id: "veg_bhuna_masala", name: "Veg Bhuna Masala", price: 380, category: "Vegetables", available: true },
        { id: "veg_paneer_mix", name: "Veg Paneer Mix", price: 410, category: "Vegetables", available: true },
        { id: "mix_vegetable", name: "Mix Vegetable", price: 380, category: "Vegetables", available: true },
        { id: "veg_do_pyaza", name: "Veg Do Pyaza", price: 380, category: "Vegetables", available: true },
        { id: "veg_achari", name: "Veg Achari", price: 380, category: "Vegetables", available: true },
        { id: "veg_lahori", name: "Veg Lahori", price: 380, category: "Vegetables", available: true },
        { id: "aloo_gobi", name: "Aloo Gobi", price: 340, category: "Vegetables", available: true },
        { id: "paneer_butter_masala", name: "Paneer Butter Masala", price: 390, category: "Paneer", available: true },
        { id: "shahi_paneer", name: "Shahi Paneer", price: 420, category: "Paneer", available: true },
        { id: "paneer_kadhai", name: "Paneer Kadhai", price: 390, category: "Paneer", available: true },
        { id: "paneer_handi", name: "Paneer Handi", price: 400, category: "Paneer", available: true },
        { id: "paneer_makhani", name: "Paneer Makhani", price: 400, category: "Paneer", available: true },
        { id: "paneer_tawa", name: "Paneer Tawa", price: 400, category: "Paneer", available: true },
        { id: "paneer_achari", name: "Paneer Achari", price: 420, category: "Paneer", available: true },
        { id: "paneer_bhuna", name: "Paneer Bhuna", price: 430, category: "Paneer", available: true },
        { id: "paneer_curry", name: "Paneer Curry", price: 450, category: "Paneer", available: true },
        { id: "paneer_do_pyaza", name: "Paneer Do Pyaza", price: 450, category: "Paneer", available: true },
        { id: "buttermilk", name: "Buttermilk", price: 20, category: "Beverages", available: true },
        { id: "salted_papad", name: "Salted Papad", price: 20, category: "Beverages", available: true },
        { id: "fried_papad", name: "Fried Papad", price: 30, category: "Beverages", available: true },
        { id: "fried_mirch", name: "Fried Mirch", price: 20, category: "Beverages", available: true },
        { id: "tomato_salad", name: "Tomato Salad", price: 50, category: "Beverages", available: true },
        { id: "water_bottle", name: "Water Bottle", price: 20, category: "Beverages", available: true }
      ];
      defaultMenu.forEach(m => {
        m.restaurant_id = restaurantId;
      });
      data.menu_items = (data.menu_items || []).concat(defaultMenu);
      writeDb(data);
    }
  }
}

// Initialize database file with default tables and menu items if it doesn't exist
export function readDb() {
  if (!fs.existsSync(dbPath)) {
    const initialData = {
      tables: [
        { id: 'T-1', table_number: '1', qr_code_token: '5a2b8e9c1f7d', status: 'empty', current_session_id: null },
        { id: 'T-2', table_number: '2', qr_code_token: '9c3f1d8e7b6a', status: 'empty', current_session_id: null },
        { id: 'T-3', table_number: '3', qr_code_token: '1e8d7c6b5a4f', status: 'empty', current_session_id: null },
        { id: 'T-4', table_number: '4', qr_code_token: 'b6a5f4e3d2c1', status: 'empty', current_session_id: null },
        { id: 'T-5', table_number: '5', qr_code_token: 'f3e2d1c0b9a8', status: 'empty', current_session_id: null }
      ],
      sessions: [],
      menu_items: [
        // Kathiyawadi
        { id: "lasaniya_dhokla", name: "Lasaniya Dhokla", price: 320, category: "Kathiyawadi", available: true },
        { id: "kathiyawadi_special", name: "Kathiyawadi Special", price: 300, category: "Kathiyawadi", available: true },
        { id: "sev_khamani", name: "Sev Khamani", price: 280, category: "Kathiyawadi", available: true },
        { id: "batata_vada", name: "Batata Vada", price: 280, category: "Kathiyawadi", available: true },
        { id: "kothimbir_vadi", name: "Kothimbir Vadi", price: 280, category: "Kathiyawadi", available: true },
        { id: "farali_sev_khaman", name: "Farali Sev Khaman", price: 300, category: "Kathiyawadi", available: true },
        { id: "dahi", name: "Dahi", price: 150, category: "Kathiyawadi", available: true },
        { id: "kadhi_bowl", name: "Kadhi Bowl", price: 150, category: "Kathiyawadi", available: true },
        { id: "masala_khaman_sev", name: "Masala Khaman (Sev)", price: 210, category: "Kathiyawadi", available: true },
        { id: "punjabi_khaman_sev", name: "Punjabi Khaman (Sev)", price: 150, category: "Kathiyawadi", available: true },
        { id: "vagharela_khaman", name: "Vagharela Khaman", price: 80, category: "Kathiyawadi", available: true },
        { id: "masala_khaman", name: "Masala Khaman", price: 75, category: "Kathiyawadi", available: true },
        { id: "pakoda_khaman", name: "Pakoda Khaman", price: 80, category: "Kathiyawadi", available: true },
        { id: "dahi_khaman", name: "Dahi Khaman", price: 90, category: "Kathiyawadi", available: true },
        { id: "dahi_tikhari", name: "Dahi Tikhari", price: 90, category: "Kathiyawadi", available: true },
        { id: "rotla_bhakhri", name: "Rotla (Bhakhri)", price: 28, category: "Kathiyawadi", available: true },
        { id: "lava_papad", name: "Lava Papad", price: 28, category: "Kathiyawadi", available: true },
        { id: "swami_roti", name: "Swami Roti", price: 15, category: "Kathiyawadi", available: true },
        { id: "math", name: "Math", price: 20, category: "Kathiyawadi", available: true },

        // Kathiyawadi Special
        { id: "kathiyawadi_roti_khaman", name: "Kathiyawadi Roti Khaman", price: 388, category: "Kathiyawadi Special", available: true },
        { id: "kathiyawadi_special_combo", name: "Kathiyawadi Special Combo", price: 300, category: "Kathiyawadi Special", available: true },
        { id: "sev_chaas_dhokli_combo", name: "Sev Chaas Dhokli Combo", price: 320, category: "Kathiyawadi Special", available: true },
        { id: "methi_gota_sev_combo", name: "Methi Gota Sev Combo", price: 380, category: "Kathiyawadi Special", available: true },
        { id: "dry_bhaji", name: "Dry Bhaji", price: 300, category: "Kathiyawadi Special", available: true },
        { id: "lilva_papad", name: "Lilva Papad", price: 340, category: "Kathiyawadi Special", available: true },
        { id: "masala_aloo", name: "Masala Aloo", price: 260, category: "Kathiyawadi Special", available: true },
        { id: "lilva_methi_vada", name: "Lilva Methi Vada", price: 320, category: "Kathiyawadi Special", available: true },
        { id: "gunda_achar", name: "Gunda Achar", price: 320, category: "Kathiyawadi Special", available: true },
        { id: "rasawala_gunda_bateta", name: "Rasawala Gunda Bateta", price: 323, category: "Kathiyawadi Special", available: true },
        { id: "lilva_sev_khaman", name: "Lilva Sev Khaman", price: 320, category: "Kathiyawadi Special", available: true },
        { id: "bateta_sev_kathiyawadi", name: "Bateta Sev Kathiyawadi", price: 320, category: "Kathiyawadi Special", available: true },
        { id: "lilva_gunda_bateta", name: "Lilva Gunda Bateta", price: 323, category: "Kathiyawadi Special", available: true },
        { id: "methi_masala", name: "Methi Masala", price: 320, category: "Kathiyawadi Special", available: true },
        { id: "lilva_rasawala_moria", name: "Lilva Rasawala Moria", price: 320, category: "Kathiyawadi Special", available: true },

        // Kaju
        { id: "kaju_kari", name: "Kaju Kari", price: 470, category: "Kaju", available: true },
        { id: "kaju_paneer", name: "Kaju Paneer", price: 470, category: "Kaju", available: true },
        { id: "kaju_masala", name: "Kaju Masala", price: 480, category: "Kaju", available: true },
        { id: "kaju_curry", name: "Kaju Curry", price: 480, category: "Kaju", available: true },
        { id: "kaju_mutter_masala", name: "Kaju Mutter Masala", price: 480, category: "Kaju", available: true },
        { id: "kaju_butter_curry", name: "Kaju Butter Curry", price: 480, category: "Kaju", available: true },
        { id: "kaju_butter_masala", name: "Kaju Butter Masala", price: 518, category: "Kaju", available: true },
        { id: "kaju_kadhai", name: "Kaju Kadhai", price: 518, category: "Kaju", available: true },
        { id: "kaju_handi", name: "Kaju Handi", price: 530, category: "Kaju", available: true },

        // Vegetables
        { id: "veg_handi", name: "Veg Handi", price: 320, category: "Vegetables", available: true },
        { id: "veg_kadhai", name: "Veg Kadhai", price: 360, category: "Vegetables", available: true },
        { id: "veg_kolhapuri", name: "Veg Kolhapuri", price: 350, category: "Vegetables", available: true },
        { id: "veg_hyderabadi", name: "Veg Hyderabadi", price: 370, category: "Vegetables", available: true },
        { id: "veg_jaipuri", name: "Veg Jaipuri", price: 350, category: "Vegetables", available: true },
        { id: "veg_tawa_masala", name: "Veg Tawa Masala", price: 370, category: "Vegetables", available: true },
        { id: "veg_chatpata", name: "Veg Chatpata", price: 380, category: "Vegetables", available: true },
        { id: "veg_makhanwala", name: "Veg Makhanwala", price: 380, category: "Vegetables", available: true },
        { id: "veg_kaju_masala", name: "Veg Kaju Masala", price: 380, category: "Vegetables", available: true },
        { id: "veg_bhuna_masala", name: "Veg Bhuna Masala", price: 380, category: "Vegetables", available: true },
        { id: "veg_paneer_mix", name: "Veg Paneer Mix", price: 410, category: "Vegetables", available: true },
        { id: "mix_vegetable", name: "Mix Vegetable", price: 380, category: "Vegetables", available: true },
        { id: "veg_do_pyaza", name: "Veg Do Pyaza", price: 380, category: "Vegetables", available: true },
        { id: "veg_achari", name: "Veg Achari", price: 380, category: "Vegetables", available: true },
        { id: "veg_lahori", name: "Veg Lahori", price: 380, category: "Vegetables", available: true },
        { id: "aloo_gobi", name: "Aloo Gobi", price: 340, category: "Vegetables", available: true },

        // Paneer
        { id: "paneer_butter_masala", name: "Paneer Butter Masala", price: 390, category: "Paneer", available: true },
        { id: "shahi_paneer", name: "Shahi Paneer", price: 420, category: "Paneer", available: true },
        { id: "paneer_kadhai", name: "Paneer Kadhai", price: 390, category: "Paneer", available: true },
        { id: "paneer_handi", name: "Paneer Handi", price: 400, category: "Paneer", available: true },
        { id: "paneer_makhani", name: "Paneer Makhani", price: 400, category: "Paneer", available: true },
        { id: "paneer_tawa", name: "Paneer Tawa", price: 400, category: "Paneer", available: true },
        { id: "paneer_achari", name: "Paneer Achari", price: 420, category: "Paneer", available: true },
        { id: "paneer_bhuna", name: "Paneer Bhuna", price: 430, category: "Paneer", available: true },
        { id: "paneer_curry", name: "Paneer Curry", price: 450, category: "Paneer", available: true },
        { id: "paneer_do_pyaza", name: "Paneer Do Pyaza", price: 450, category: "Paneer", available: true },

        // Beverages
        { id: "buttermilk", name: "Buttermilk", price: 20, category: "Beverages", available: true },
        { id: "salted_papad", name: "Salted Papad", price: 20, category: "Beverages", available: true },
        { id: "fried_papad", name: "Fried Papad", price: 30, category: "Beverages", available: true },
        { id: "fried_mirch", name: "Fried Mirch", price: 20, category: "Beverages", available: true },
        { id: "tomato_salad", name: "Tomato Salad", price: 50, category: "Beverages", available: true },
        { id: "water_bottle", name: "Water Bottle", price: 20, category: "Beverages", available: true }
      ],
      orders: [],
      help_requests: [],
      bills: [],
      users: [
        {
          _id: 'U-001',
          email: 'manager@test.com',
          password: 'admin123',
          role: 'manager',
          restaurant_id: 'r_001'
        },
        {
          _id: 'U-002',
          email: 'kitchen@test.com',
          password: 'kitchen123',
          role: 'kitchen',
          restaurant_id: 'r_001'
        }
      ]
    };
    initialData.tables.forEach(t => { t.restaurant_id = 'r_001'; });
    initialData.menu_items.forEach(m => { m.restaurant_id = 'r_001'; });
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
  }
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  if (!dbData.users) {
    dbData.users = [
      {
        _id: 'U-001',
        email: 'manager@test.com',
        password: 'admin123',
        role: 'manager',
        restaurant_id: 'r_001'
      },
      {
        _id: 'U-002',
        email: 'kitchen@test.com',
        password: 'kitchen123',
        role: 'kitchen',
        restaurant_id: 'r_001'
      }
    ];
    if (dbData.tables) {
      dbData.tables.forEach(t => { if (!t.restaurant_id) t.restaurant_id = 'r_001'; });
    }
    if (dbData.menu_items) {
      dbData.menu_items.forEach(m => { if (!m.restaurant_id) m.restaurant_id = 'r_001'; });
    }
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf-8');
  }
  return dbData;
}

export function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

const dbInstance = {
  collection: (name) => {
    return {
      find: (filter = {}) => {
        const store = managerStorage.getStore();
        const restaurantId = name !== 'users' ? store?.restaurantId : null;
        checkAndInitializeRestaurantData(restaurantId, name);
        const data = readDb();
        const items = data[name] || [];
        
        let filtered = items.filter(item => {
          if (restaurantId && item.restaurant_id !== restaurantId) {
            return false;
          }
          return Object.entries(filter).every(([key, value]) => {
            if (key.includes('.')) {
              const parts = key.split('.');
              if (parts[0] === 'items') {
                return item.items && item.items.some(subItem => subItem[parts[1]] === value);
              }
            }
            if (value && typeof value === 'object' && value.$gte) {
              return new Date(item[key]).getTime() >= new Date(value.$gte).getTime();
            }
            return item[key] === value;
          });
        });

        return {
          toArray: async () => filtered,
          sort: (sortObj) => {
            const key = Object.keys(sortObj)[0];
            const asc = sortObj[key] === 1;
            filtered.sort((a, b) => {
              const valA = a[key] instanceof Date ? a[key].getTime() : (typeof a[key] === 'string' && !isNaN(Date.parse(a[key])) ? new Date(a[key]).getTime() : a[key]);
              const valB = b[key] instanceof Date ? b[key].getTime() : (typeof b[key] === 'string' && !isNaN(Date.parse(b[key])) ? new Date(b[key]).getTime() : b[key]);
              if (valA < valB) return asc ? -1 : 1;
              if (valA > valB) return asc ? 1 : -1;
              return 0;
            });
            return { toArray: async () => filtered };
          }
        };
      },
      findOne: async (filter = {}) => {
        const store = managerStorage.getStore();
        const restaurantId = name !== 'users' ? store?.restaurantId : null;
        checkAndInitializeRestaurantData(restaurantId, name);
        const data = readDb();
        const items = data[name] || [];
        return items.find(item => {
          if (restaurantId && item.restaurant_id !== restaurantId) {
            return false;
          }
          return Object.entries(filter).every(([key, value]) => {
            if (key.includes('.')) {
              const parts = key.split('.');
              if (parts[0] === 'items') {
                return item.items && item.items.some(subItem => subItem[parts[1]] === value);
              }
            }
            return item[key] === value;
          });
        }) || null;
      },
      insertOne: async (doc) => {
        const store = managerStorage.getStore();
        const restaurantId = name !== 'users' ? store?.restaurantId : null;
        if (restaurantId) {
          doc.restaurant_id = restaurantId;
        }
        const data = readDb();
        if (!doc._id) {
          doc._id = Math.random().toString(36).substring(2, 9).toUpperCase();
        }
        data[name] = data[name] || [];
        data[name].push(doc);
        writeDb(data);
        return { insertedId: doc._id };
      },
      updateOne: async (filter, update, options = {}) => {
        const store = managerStorage.getStore();
        const restaurantId = name !== 'users' ? store?.restaurantId : null;
        const data = readDb();
        const items = data[name] || [];
        
        let index = items.findIndex(item => {
          if (restaurantId && item.restaurant_id !== restaurantId) {
            return false;
          }
          return Object.entries(filter).every(([key, value]) => {
            if (key.includes('.')) {
              const parts = key.split('.');
              if (parts[0] === 'items') {
                return item.items && item.items.some(subItem => subItem[parts[1]] === value);
              }
            }
            return item[key] === value;
          });
        });

        if (index === -1 && options.upsert) {
          const newDoc = { ...filter };
          if (restaurantId) {
            newDoc.restaurant_id = restaurantId;
          }
          if (update.$set) {
            Object.assign(newDoc, update.$set);
          }
          if (!newDoc._id) {
            newDoc._id = Math.random().toString(36).substring(2, 9).toUpperCase();
          }
          items.push(newDoc);
          data[name] = items;
          writeDb(data);
          return { modifiedCount: 1, upsertedId: newDoc._id };
        }

        if (index !== -1) {
          const item = items[index];
          if (update.$set) {
            Object.entries(update.$set).forEach(([key, value]) => {
              if (key.includes('.')) {
                const parts = key.split('.');
                if (parts[0] === 'items' && parts[1] === '$' && parts[2]) {
                  const subFilterKey = Object.keys(filter).find(k => k.startsWith('items.'));
                  const subFilterVal = filter[subFilterKey];
                  const subKey = subFilterKey.split('.')[1];
                  
                  item.items = item.items.map(subItem => {
                    if (subItem[subKey] === subFilterVal) {
                      subItem[parts[2]] = value;
                    }
                    return subItem;
                  });
                }
              } else {
                item[key] = value;
              }
            });
          }
          if (restaurantId) {
            item.restaurant_id = restaurantId;
          }
          items[index] = item;
          data[name] = items;
          writeDb(data);
          return { modifiedCount: 1 };
        }
        return { modifiedCount: 0 };
      },
      updateMany: async (filter, update) => {
        const store = managerStorage.getStore();
        const restaurantId = name !== 'users' ? store?.restaurantId : null;
        const data = readDb();
        const items = data[name] || [];
        let modifiedCount = 0;
        
        const updatedItems = items.map(item => {
          if (restaurantId && item.restaurant_id !== restaurantId) {
            return item;
          }
          const matches = Object.entries(filter).every(([key, value]) => item[key] === value);
          if (matches) {
            modifiedCount++;
            if (update.$set) {
              Object.entries(update.$set).forEach(([key, value]) => {
                item[key] = value;
              });
            }
            if (restaurantId) {
              item.restaurant_id = restaurantId;
            }
          }
          return item;
        });

        data[name] = updatedItems;
        writeDb(data);
        return { modifiedCount };
      },
      deleteOne: async (filter) => {
        const store = managerStorage.getStore();
        const restaurantId = name !== 'users' ? store?.restaurantId : null;
        const data = readDb();
        const items = data[name] || [];
        const initialLen = items.length;
        
        const filtered = items.filter(item => {
          if (restaurantId && item.restaurant_id !== restaurantId) {
            return true;
          }
          return !Object.entries(filter).every(([key, value]) => item[key] === value);
        });

        data[name] = filtered;
        writeDb(data);
        return { deletedCount: initialLen - filtered.length };
      },
      deleteMany: async (filter) => {
        const store = managerStorage.getStore();
        const restaurantId = name !== 'users' ? store?.restaurantId : null;
        const data = readDb();
        const items = data[name] || [];
        const initialLen = items.length;
        
        const filtered = items.filter(item => {
          if (restaurantId && item.restaurant_id !== restaurantId) {
            return true;
          }
          return !Object.entries(filter).every(([key, value]) => item[key] === value);
        });

        data[name] = filtered;
        writeDb(data);
        return { deletedCount: initialLen - filtered.length };
      },
      countDocuments: async () => {
        const store = managerStorage.getStore();
        const restaurantId = name !== 'users' ? store?.restaurantId : null;
        const data = readDb();
        const items = data[name] || [];
        if (restaurantId) {
          return items.filter(item => item.restaurant_id === restaurantId).length;
        }
        return items.length;
      },
      insertMany: async (docs) => {
        const store = managerStorage.getStore();
        const restaurantId = name !== 'users' ? store?.restaurantId : null;
        const data = readDb();
        data[name] = data[name] || [];
        docs.forEach(doc => {
          if (restaurantId) {
            doc.restaurant_id = restaurantId;
          }
          if (!doc._id) {
            doc._id = Math.random().toString(36).substring(2, 9).toUpperCase();
          }
          data[name].push(doc);
        });
        writeDb(data);
        return { insertedCount: docs.length };
      },
      aggregate: (pipeline) => {
        return {
          toArray: async () => {
            throw new Error("Aggregate pipeline not supported on simple JSON database. Use Javascript lookup maps instead.");
          }
        };
      }
    };
  }
};

export async function connectDb() {
  console.log("Initializing local JSON database store...");
  readDb();
  console.log("✓ JSON persistent store ready: " + dbPath);
  return dbInstance;
}

export function getDb() {
  return dbInstance;
}
export default dbInstance;
