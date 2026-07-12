const fs = require('fs');
const path = require('path');

// Change this to where you saved the file
const INPUT_FILE = './scripts/all.txt';
const OUTPUT_FILE = './constants/dictionary/names.json';

const content = fs.readFileSync(INPUT_FILE, 'utf8');
const names = content
    .split('\n')
    .map(n => n.trim())
    .filter(n => n.length > 1);

const grouped = {};

for (const name of names) {
    const letter = name[0].toUpperCase();
    if (!letter.match(/[A-Z]/)) continue;
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(name.toLowerCase());
}

// Sort each letter array
for (const letter of Object.keys(grouped)) {
    grouped[letter] = [...new Set(grouped[letter])].sort();
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(grouped, null, 2));
console.log('✅ Done! Names converted successfully!');
console.log(`Total letters covered: ${Object.keys(grouped).length}`);