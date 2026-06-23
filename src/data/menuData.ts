export interface MenuItem {
  name: string;
  price: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
  items: MenuItem[];
}

export const menuData = {
  categories: [
    {
      id:"kathiyawadi",
      name:"Kathiyawadi",
      emoji:"🍲",
      color:"#E07B39",
      items:[
        {name:"Lasaniya Dhokla", price:320},
        {name:"Kathiyawadi Special", price:300},
        {name:"Sev Khamani", price:280},
        {name:"Batata Vada", price:280},
        {name:"Kothimbir Vadi", price:280},
        {name:"Farali Sev Khaman", price:300},
        {name:"Dahi", price:150},
        {name:"Kadhi Bowl", price:150},
        {name:"Masala Khaman (Sev)", price:210},
        {name:"Punjabi Khaman (Sev)", price:150},
        {name:"Vagharela Khaman", price:80},
        {name:"Masala Khaman", price:75},
        {name:"Pakoda Khaman", price:80},
        {name:"Dahi Khaman", price:90},
        {name:"Dahi Tikhari", price:90},
        {name:"Rotla (Bhakhri)", price:28},
        {name:"Lava Papad", price:28},
        {name:"Swami Roti", price:15},
        {name:"Math", price:20}
      ]
    },
    {
      id:"kathiyawadi_special",
      name:"Kathiyawadi Special",
      emoji:"⭐",
      color:"#C0392B",
      items:[
        {name:"Kathiyawadi Roti Khaman", price:388},
        {name:"Kathiyawadi Special Combo", price:300},
        {name:"Sev Chaas Dhokli Combo", price:320},
        {name:"Methi Gota Sev Combo", price:380},
        {name:"Dry Bhaji", price:300},
        {name:"Lilva Papad", price:340},
        {name:"Masala Aloo", price:260},
        {name:"Lilva Methi Vada", price:320},
        {name:"Gunda Achar", price:320},
        {name:"Rasawala Gunda Bateta", price:323},
        {name:"Lilva Sev Khaman", price:320},
        {name:"Bateta Sev Kathiyawadi", price:320},
        {name:"Lilva Gunda Bateta", price:323},
        {name:"Methi Masala", price:320},
        {name:"Lilva Rasawala Moria", price:320}
      ]
    },
    {
      id:"kaju",
      name:"Kaju",
      emoji:"🥜",
      color:"#8E6B3E",
      items:[
        {name:"Kaju Kari", price:470},
        {name:"Kaju Paneer", price:470},
        {name:"Kaju Masala", price:480},
        {name:"Kaju Curry", price:480},
        {name:"Kaju Mutter Masala", price:480},
        {name:"Kaju Butter Curry", price:480},
        {name:"Kaju Butter Masala", price:518},
        {name:"Kaju Kadhai", price:518},
        {name:"Kaju Handi", price:530}
      ]
    },
    {
      id:"vegetables",
      name:"Vegetables",
      emoji:"🥗",
      color:"#27AE60",
      items:[
        {name:"Veg Handi", price:320},
        {name:"Veg Kadhai", price:360},
        {name:"Veg Kolhapuri", price:350},
        {name:"Veg Hyderabadi", price:370},
        {name:"Veg Jaipuri", price:350},
        {name:"Veg Tawa Masala", price:370},
        {name:"Veg Chatpata", price:380},
        {name:"Veg Makhanwala", price:380},
        {name:"Veg Kaju Masala", price:380},
        {name:"Veg Bhuna Masala", price:380},
        {name:"Veg Paneer Mix", price:410},
        {name:"Mix Vegetable", price:380},
        {name:"Veg Do Pyaza", price:380},
        {name:"Veg Achari", price:380},
        {name:"Veg Lahori", price:380},
        {name:"Aloo Gobi", price:340}
      ]
    },
    {
      id:"paneer",
      name:"Paneer",
      emoji:"🧀",
      color:"#F39C12",
      items:[
        {name:"Paneer Butter Masala", price:390},
        {name:"Shahi Paneer", price:420},
        {name:"Paneer Kadhai", price:390},
        {name:"Paneer Handi", price:400},
        {name:"Paneer Makhani", price:400},
        {name:"Paneer Tawa", price:400},
        {name:"Paneer Achari", price:420},
        {name:"Paneer Bhuna", price:430},
        {name:"Paneer Curry", price:450},
        {name:"Paneer Do Pyaza", price:450}
      ]
    },
    {
      id:"soup",
      name:"Soup",
      emoji:"🍜",
      color:"#2980B9",
      items:[
        {name:"Tomato Soup", price:120},
        {name:"Veg Manchow Soup", price:130},
        {name:"Hot and Sour Soup", price:130},
        {name:"Sweet Corn Soup", price:135},
        {name:"Lemon Coriander Soup", price:145}
      ]
    },
    {
      id:"chinese",
      name:"Chinese",
      emoji:"🥡",
      color:"#E74C3C",
      items:[
        {name:"Veg Manchurian", price:160},
        {name:"Veg Lollipop", price:160},
        {name:"Crispy Veg", price:160},
        {name:"Veg Fried Rice", price:160},
        {name:"Veg Noodles", price:160},
        {name:"Veg Schezwan", price:170},
        {name:"Paneer Chilli", price:180},
        {name:"Paneer Manchurian", price:210}
      ]
    },
    {
      id:"tandoor",
      name:"Tandoor",
      emoji:"🔥",
      color:"#E67E22",
      items:[
        {name:"Plain Tandoori Roti", price:35},
        {name:"Butter Tandoori Roti", price:40},
        {name:"Plain Tandoori Paratha", price:45},
        {name:"Butter Tandoori Paratha", price:50},
        {name:"Plain Kulcha", price:50},
        {name:"Butter Kulcha", price:50},
        {name:"Plain Naan", price:50},
        {name:"Butter Naan", price:60},
        {name:"Cheese Naan", price:95},
        {name:"Cheese Garlic Naan", price:95}
      ]
    },
    {
      id:"dal",
      name:"Dal",
      emoji:"🫕",
      color:"#D35400",
      items:[
        {name:"Dal Fry", price:130},
        {name:"Dal Tadka", price:150},
        {name:"Dal Makhani", price:150},
        {name:"Dal Kolhapuri", price:150}
      ]
    },
    {
      id:"rice",
      name:"Rice",
      emoji:"🍚",
      color:"#16A085",
      items:[
        {name:"Jeera Rice", price:110},
        {name:"Veg Pulav", price:150},
        {name:"Veg Biryani", price:155},
        {name:"Kaju Pulav", price:165},
        {name:"Hyderabadi Biryani", price:160}
      ]
    },
    {
      id:"cholebhature",
      name:"Chole Bhature",
      emoji:"🫓",
      color:"#8E44AD",
      items:[
        {name:"Chole Bhature", price:150},
        {name:"Special Chole Bhature", price:150},
        {name:"Paneer Chole Bhature", price:160},
        {name:"Extra Bhature", price:50}
      ]
    },
    {
      id:"beverages",
      name:"Beverages",
      emoji:"🥤",
      color:"#2ECC71",
      items:[
        {name:"Buttermilk", price:20},
        {name:"Salted Papad", price:20},
        {name:"Fried Papad", price:30},
        {name:"Fried Mirch", price:20},
        {name:"Tomato Salad", price:50},
        {name:"Water Bottle", price:20}
      ]
    },
    {
      id:"desserts",
      name:"Desserts",
      emoji:"🍬",
      color:"#E91E63",
      items:[
        {name:"Gulab Jamun", price:30},
        {name:"Ladoo", price:30}
      ]
    }
  ]
};
