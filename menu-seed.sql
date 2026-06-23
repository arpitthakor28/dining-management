-- COPY AND PASTE THIS DIRECTLY INTO YOUR SUPABASE SQL EDITOR!

INSERT INTO menu_items (id, name, price, kitchen_station, available) VALUES
('lasaniya_dhokla', 'Lasaniya Dhokla', 320.00, 'kathiyawadi', true),
('kathiyawadi_special', 'Kathiyawadi Special', 300.00, 'kathiyawadi', true),
('sev_khamani', 'Sev Khamani', 280.00, 'kathiyawadi', true),
('batata_vada', 'Batata Vada', 280.00, 'kathiyawadi', true),
('kothimbir_vadi', 'Kothimbir Vadi', 280.00, 'kathiyawadi', true),
('farali_sev_khaman', 'Farali Sev Khaman', 300.00, 'kathiyawadi', true),
('dahi', 'Dahi', 150.00, 'kathiyawadi', true),
('kadhi_bowl', 'Kadhi Bowl', 150.00, 'kathiyawadi', true),
('masala_khaman_sev', 'Masala Khaman (Sev)', 210.00, 'kathiyawadi', true),
('punjabi_khaman_sev', 'Punjabi Khaman (Sev)', 150.00, 'kathiyawadi', true),
('vagharela_khaman', 'Vagharela Khaman', 80.00, 'kathiyawadi', true),
('masala_khaman', 'Masala Khaman', 75.00, 'kathiyawadi', true),
('pakoda_khaman', 'Pakoda Khaman', 80.00, 'kathiyawadi', true),
('dahi_khaman', 'Dahi Khaman', 90.00, 'kathiyawadi', true),
('dahi_tikhari', 'Dahi Tikhari', 90.00, 'kathiyawadi', true),
('rotla_bhakhri', 'Rotla (Bhakhri)', 28.00, 'kathiyawadi', true),
('lava_papad', 'Lava Papad', 28.00, 'kathiyawadi', true),
('swami_roti', 'Swami Roti', 15.00, 'kathiyawadi', true),
('math', 'Math', 20.00, 'kathiyawadi', true),

('mix_vegetable', 'Mix Vegetable', 380.00, 'vegetables', true),
('veg_handi', 'Veg Handi', 320.00, 'vegetables', true),
('paneer_butter_masala', 'Paneer Butter Masala', 390.00, 'paneer', true),

('plain_tandoori_roti', 'Plain Tandoori Roti', 35.00, 'tandoor', true),
('butter_tandoori_roti', 'Butter Tandoori Roti', 40.00, 'tandoor', true),
('garlic_naan', 'Garlic Naan', 45.00, 'tandoor', true),

('buttermilk', 'Buttermilk', 20.00, 'beverages', true),
('salted_papad', 'Salted Papad', 20.00, 'beverages', true),
('fried_papad', 'Fried Papad', 30.00, 'beverages', true)
ON CONFLICT (id) DO NOTHING;
