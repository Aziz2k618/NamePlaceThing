const fs = require('fs');

const INPUT_FILE = './scripts/Open-food-calories.json';
const OUTPUT_FILE = './constants/dictionary/foods.json';

const raw = fs.readFileSync(INPUT_FILE, 'utf8');
const items = JSON.parse(raw);

const grouped = {};

for (const item of items) {
    // Use english_name, fall back to name
    const foodName = (item.english_name || item.name || '').trim();

    // Clean up names like "White rice (raw)" → take only "White rice"
    const cleanName = foodName.split('(')[0].trim();

    if (!cleanName || cleanName.length < 2) continue;

    const letter = cleanName[0].toUpperCase();
    if (!letter.match(/[A-Z]/)) continue;

    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(cleanName.toLowerCase());
}

// Remove duplicates and sort
for (const letter of Object.keys(grouped)) {
    grouped[letter] = [...new Set(grouped[letter])].sort();
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(grouped, null, 2));
console.log('✅ Done! Foods converted successfully!');
console.log(`Total letters covered: ${Object.keys(grouped).length}`);
for (const letter of Object.keys(grouped).sort()) {
    console.log(`${letter}: ${grouped[letter].length} foods`);
}