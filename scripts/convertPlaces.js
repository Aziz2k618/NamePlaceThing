const fs = require('fs');

const INPUT_FILE = './scripts/world-cities.csv';
const OUTPUT_FILE = './constants/dictionary/places.json';

const content = fs.readFileSync(INPUT_FILE, 'utf8');
const lines = content.split('\n').slice(1);

const grouped = {};

for (const line of lines) {
    const parts = line.split(',');
    if (parts.length < 2) continue;

    const cityName = parts[0].trim();
    const countryName = parts[1].trim();

    [cityName, countryName].forEach(name => {
        if (!name || name.length < 2) return;
        const letter = name[0].toUpperCase();
        if (!letter.match(/[A-Z]/)) return;
        if (!grouped[letter]) grouped[letter] = [];
        grouped[letter].push(name.toLowerCase());
    });
}

for (const letter of Object.keys(grouped)) {
    grouped[letter] = [...new Set(grouped[letter])].sort();
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(grouped, null, 2));
console.log('✅ Done! Places + Countries converted successfully!');
console.log(`Total letters covered: ${Object.keys(grouped).length}`);

for (const letter of Object.keys(grouped).sort()) {
    console.log(`${letter}: ${grouped[letter].length} places`);
}