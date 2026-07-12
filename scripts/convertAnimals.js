const fs = require('fs');

// --- Original hardcoded list ---
const hardcodedAnimals = [
    "Aardvark", "Albatross", "Alligator", "Alpaca", "Anaconda", "Angelfish", "Ant", "Anteater", "Antelope", "Ape", "Armadillo", "Axolotl",
    "Baboon", "Badger", "Barracuda", "Bat", "Bear", "Beaver", "Bee", "Bison", "Boa", "Boar", "Buffalo", "Bullfrog", "Butterfly",
    "Camel", "Capybara", "Cat", "Catfish", "Centipede", "Chameleon", "Cheetah", "Chicken", "Chimpanzee", "Chinchilla", "Chipmunk", "Cobra", "Cockroach", "Condor", "Coyote", "Crab", "Crane", "Crocodile", "Crow",
    "Deer", "Dingo", "Dog", "Dolphin", "Donkey", "Dragonfly", "Duck",
    "Eagle", "Earthworm", "Eel", "Elephant", "Elk", "Emu",
    "Falcon", "Ferret", "Finch", "Firefly", "Fish", "Flamingo", "Fly", "Fox", "Frog",
    "Gazelle", "Gecko", "Gerbil", "Giraffe", "Gnu", "Goat", "Goldfish", "Gorilla", "Grasshopper",
    "Hamster", "Hare", "Hawk", "Hedgehog", "Hippo", "Hornet", "Horse", "Hummingbird", "Hyena",
    "Ibis", "Iguana", "Impala",
    "Jackal", "Jaguar", "Jellyfish",
    "Kangaroo", "Koala", "Komodo Dragon",
    "Ladybug", "Lemur", "Leopard", "Lion", "Llama", "Lobster", "Lynx",
    "Macaw", "Manatee", "Manta Ray", "Markhor", "Mongoose", "Monkey", "Moose", "Mosquito", "Mouse", "Mule",
    "Narwhal", "Newt", "Nightingale", "Nilgai",
    "Octopus", "Orangutan", "Ostrich", "Otter", "Owl", "Ox",
    "Panda", "Panther", "Parrot", "Peacock", "Pelican", "Penguin", "Pig", "Pigeon", "Piranha", "Platypus", "Polar Bear", "Porcupine", "Python",
    "Quail", "Quetzal",
    "Rabbit", "Raccoon", "Ram", "Rat", "Raven", "Rhinoceros", "Robin", "Rohu",
    "Salamander", "Salmon", "Scorpion", "Seal", "Shark", "Sheep", "Skunk", "Sloth", "Snail", "Snake", "Snow Leopard", "Spider", "Squid", "Squirrel", "Starfish", "Stingray", "Swan",
    "Tiger", "Toad", "Tortoise", "Toucan", "Turkey", "Turtle",
    "Urial",
    "Vulture",
    "Walrus", "Wasp", "Weasel", "Whale", "Wolf", "Wolverine", "Wombat", "Woodpecker", "Worm",
    "Xenops",
    "Yak",
    "Zebra", "Zebu",
    // South Asian animals
    "Blackbuck", "Chinkara", "Gharial", "Hangul", "Himalayan Bear", "Indus Dolphin",
    "Indian Cobra", "Indian Elephant", "Indian Rhino", "Indian Peafowl",
    "King Cobra", "Monitor Lizard", "Mugger", "Russell Viper", "Sarus Crane", "Snow Leopard"
];

// --- Read new animals from unfiltered text file ---
const UNFILTERED_FILE = './scripts/animals-unfiltered.txt';
const content = fs.readFileSync(UNFILTERED_FILE, 'utf8');
const rawLines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

// Filter out scientific/latin names, section markers, and junk
function isScientificName(name) {
    // Scientific names are typically two lowercase latin words e.g. "Anas platyrhynchos"
    // We detect them by checking if ALL words after the first are fully lowercase
    // and the name has no common English animal keywords
    const words = name.split(' ');
    if (words.length < 2) return false;
    // If first word is capitalized and all remaining words are fully lowercase single words
    // that look latin (no common English patterns), it's likely scientific
    const latinPattern = /^[a-z]+$/;
    const allRestLatin = words.slice(1).every(w => latinPattern.test(w));
    if (!allRestLatin) return false;
    // Additional check: if the name contains common descriptive English words, it's NOT scientific
    const englishWords = ['black', 'white', 'red', 'blue', 'brown', 'grey', 'gray', 'green', 'yellow',
        'golden', 'african', 'asian', 'american', 'european', 'indian', 'australian',
        'wild', 'common', 'greater', 'lesser', 'giant', 'little', 'big', 'small',
        'north', 'south', 'east', 'west', 'sea', 'river', 'mountain', 'rock', 'tree',
        'bush', 'desert', 'arctic', 'polar', 'tropical', 'pine', 'snow', 'sand',
        'ground', 'water', 'prairie', 'savanna', 'forest', 'jungle', 'highland',
        'horned', 'crested', 'banded', 'spotted', 'striped', 'collared', 'ringtail',
        'pied', 'scarlet', 'royal', 'painted', 'crowned', 'emerald', 'tawny',
        'lava', 'vine', 'fruit', 'bird', 'pink', 'purple', 'roan', 'sable',
        'timber', 'honey', 'brown', 'beaded', 'mexican', 'dusky', 'feral',
        'salmon', 'sugar', 'masked', 'bald', 'hoary', 'sociable', 'elegant',
        'magnificent', 'downy', 'laughing', 'peregrine', 'sloth'];
    const lowerName = name.toLowerCase();
    for (const ew of englishWords) {
        if (lowerName.includes(ew)) return false;
    }
    return true;
}

// Section markers in the file like "Atop", "Btop", etc.
const sectionMarkerPattern = /^[A-Z]top$/;

// Words that are too generic or not really animal names
const excludeList = new Set([
    'bird', 'bleu', 'btop', 'ctop', 'dtop', 'etop', 'ftop', 'gtop', 'htop',
    'itop', 'jtop', 'ktop', 'ltop', 'mtop', 'ntop', 'otop', 'ptop', 'qtop',
    'rtop', 'stop', 'ttop', 'utop', 'vtop', 'wtop', 'ytop', 'ztop',
    'insect', 'monster', 'devil', 'dragon', 'pie', 'constrictor', 'gazer',
    'trotter', 'creeper', 'dik'
]);

const unfilteredAnimals = rawLines.filter(name => {
    if (!name || name.length < 2) return false;
    const firstChar = name[0];
    if (!/[A-Z]/.test(firstChar)) return false;
    if (sectionMarkerPattern.test(name)) return false;
    if (excludeList.has(name.toLowerCase())) return false;
    if (isScientificName(name)) return false;
    return true;
});

// --- Merge both lists ---
const allAnimals = [...hardcodedAnimals, ...unfilteredAnimals];

const grouped = {};

for (const animal of allAnimals) {
    const letter = animal[0].toUpperCase();
    if (!letter.match(/[A-Z]/)) continue;
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(animal.toLowerCase());
}

// Deduplicate and sort
for (const letter of Object.keys(grouped)) {
    grouped[letter] = [...new Set(grouped[letter])].sort();
}

// Count stats
const oldCount = hardcodedAnimals.length;
let newCount = 0;
for (const letter of Object.keys(grouped)) {
    newCount += grouped[letter].length;
}

fs.writeFileSync('./constants/dictionary/animals.json', JSON.stringify(grouped, null, 2));
console.log('✅ Done! Animals merged successfully!');
console.log(`Original list: ${oldCount} animals`);
console.log(`New total (after merge + dedup): ${newCount} animals`);
console.log(`Added ${newCount - oldCount} new animals!`);
console.log('');
for (const letter of Object.keys(grouped).sort()) {
    console.log(`${letter}: ${grouped[letter].length} animals`);
}