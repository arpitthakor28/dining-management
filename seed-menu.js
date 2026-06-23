import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://simeqwxkzaixmsirqvfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpbWVxd3hremFpeG1zaXJxdmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxOTU5MTksImV4cCI6MjA5Mjc3MTkxOX0.pNaDDBE9aAy7obtm91ufjZ-NF5Qbpdp4Sx8N7tG6dks'
);

const menuData = {
  categories: [
    {
      id: "kathiyawadi", items:[
         {name:"Lasaniya Dhokla", price:320}, {name:"Kathiyawadi Special", price:300}, {name:"Sev Khamani", price:280},
         {name:"Batata Vada", price:280}, {name:"Kothimbir Vadi", price:280}, {name:"Farali Sev Khaman", price:300},
         {name:"Dahi", price:150}, {name:"Kadhi Bowl", price:150}, {name:"Masala Khaman (Sev)", price:210}, {name:"Punjabi Khaman (Sev)", price:150},
         {name:"Vagharela Khaman", price:80}, {name:"Masala Khaman", price:75}, {name:"Pakoda Khaman", price:80},
         {name:"Dahi Khaman", price:90}, {name:"Dahi Tikhari", price:90}, {name:"Rotla (Bhakhri)", price:28},
         {name:"Lava Papad", price:28}, {name:"Swami Roti", price:15}, {name:"Math", price:20}
      ]
    }, {
      id: "vegetables", items:[
        {name:"Mix Vegetable", price:380}, {name:"Veg Handi", price:320}, {name:"Paneer Butter Masala", price:390}
      ]
    }, {
      id: "tandoor", items:[
        {name:"Plain Tandoori Roti", price:35}, {name:"Butter Tandoori Roti", price:40}, {name:"Garlic Naan", price:45}
      ]
    }, {
      id: "beverages", items:[
        {name:"Buttermilk", price:20}, {name:"Salted Papad", price:20}, {name:"Fried Papad", price:30}
      ]
    }
  ]
};

async function seed() {
  console.log('Packaging Menu Data...');
  const formattedItems = [];
  
  for (const cat of menuData.categories) {
    for (const item of cat.items) {
      formattedItems.push({
        id: item.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name: item.name,
        price: item.price,
        kitchen_station: cat.id,
        available: true
      });
    }
  }

  console.log(`Pushing ${formattedItems.length} core items to Supabase PostgreSQL...`);
  
  const { error } = await supabase
    .from('menu_items')
    .upsert(formattedItems);

  if (error) {
    console.error('Error seeding menu:', error.message);
  } else {
    console.log('✓ SUCCESS: Menu Data is perfectly visible in the Cloud now!');
  }
}

seed();
