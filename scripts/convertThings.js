const fs = require('fs');

const INPUT_FILE = './scripts/things.json';
const OUTPUT_FILE = './constants/dictionary/things.json';

const raw = fs.readFileSync(INPUT_FILE, 'utf8');
const data = JSON.parse(raw);

const grouped = {};

for (const [letter, words] of Object.entries(data.words_by_letter)) {
    grouped[letter] = words.map(w => w.toLowerCase());
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(grouped, null, 2));
console.log('✅ Done! Things converted successfully!');
for (const letter of Object.keys(grouped).sort()) {
    console.log(`${letter}: ${grouped[letter].length} things`);
}