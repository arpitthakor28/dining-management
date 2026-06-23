import fs from 'fs';

const data = fs.readFileSync('./src/data/menuData.ts', 'utf8');

const categories = data.match(/id:"([^"]+)"[\s\S]*?items:\[([\s\S]*?)\]/g);
let sql = "INSERT INTO menu_items (id, name, price, kitchen_station, available) VALUES\n";
const rows = [];

if (categories) {
  categories.forEach(cat => {
    const catIdMatch = cat.match(/id:"([^"]+)"/);
    const catId = catIdMatch ? catIdMatch[1] : 'unknown';
    
    const itemsRegex = /{name:"([^"]+)", price:(\d+)}/g;
    let match;
    while ((match = itemsRegex.exec(cat)) !== null) {
      const name = match[1];
      const price = match[2];
      const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      rows.push(`('${id}', '${name.replace(/'/g, "''")}', ${price}.00, '${catId}', true)`);
    }
  });
}

sql += rows.join(",\n") + "\nON CONFLICT (id) DO NOTHING;";
fs.writeFileSync('full-menu-seed.sql', sql);
console.log(`Successfully generated SQL for ${rows.length} total items!`);
