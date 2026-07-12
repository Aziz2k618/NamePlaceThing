const fs = require('fs');

const INPUT_FILE = './scripts/HollywoodMovies.csv';
const OUTPUT_FILE = './constants/dictionary/movies.json';

const content = fs.readFileSync(INPUT_FILE, 'utf8');
const lines = content.split('\n').slice(1);

const grouped = {};

for (const line of lines) {
    const title = line.split(',')[0].trim();
    if (!title || title.length < 2) continue;

    const letter = title[0].toUpperCase();
    if (!letter.match(/[A-Z]/)) continue;

    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(title.toLowerCase());
}

for (const letter of Object.keys(grouped)) {
    grouped[letter] = [...new Set(grouped[letter])].sort();
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(grouped, null, 2));
console.log('✅ Done! Movies converted successfully!');
for (const letter of Object.keys(grouped).sort()) {
    console.log(`${letter}: ${grouped[letter].length} movies`);
}