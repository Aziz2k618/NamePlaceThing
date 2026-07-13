import animals from './animals.json';
import brands from './brands.json';
import colors from './colors.json';
import foods from './foods.json';
import fruits from './fruits.json';
import movies from './movies.json';
import names from './names.json';
import places from './places.json';
import professions from './professions.json';
import sports from './sports.json';
import things from './things.json';
import vegetables from './vegetables.json';

type DictionaryMap = Record<string, string[]>;

const dictionaries: Record<string, DictionaryMap> = {
    Name: names as DictionaryMap,
    Place: places as DictionaryMap,
    Animal: animals as DictionaryMap,
    Thing: things as DictionaryMap,
    Food: foods as DictionaryMap,
    Movie: movies as DictionaryMap,
    Sport: sports as DictionaryMap,
    Brand: brands as DictionaryMap,
    Vegetable: vegetables as DictionaryMap,
    Fruit: fruits as DictionaryMap,
    Color: colors as DictionaryMap,
    Profession: professions as DictionaryMap,
};

function cleanWord(word: string): string {
    return word.toLowerCase().trim()
        .replace(/\s+/g, ' ')  // normalize spaces
        .replace(/[^a-z0-9 ]/g, ''); // remove special chars
}

export function validateAnswer(
    category: string,
    letter: string,
    answer: string
): boolean {
    if (!answer || answer.trim().length < 2) return false;

    const cleanAnswer = cleanWord(answer);

    // Must start with correct letter
    if (cleanAnswer[0] !== letter.toLowerCase()) return false;

    const dict = dictionaries[category];

    // Unknown category = benefit of doubt
    if (!dict) return true;

    const wordList = dict[letter.toUpperCase()] || [];

    // No words for this letter = benefit of doubt
    if (wordList.length === 0) return true;

    // Check against dictionary with fuzzy matching
    return wordList.some(word => {
        const w = cleanWord(word);
        const a = cleanAnswer;

        return (
            w === a ||                          // exact match
            w.replace(/\s/g, '') === a.replace(/\s/g, '') || // ignore spaces
            w.startsWith(a) ||                  // dict word starts with answer
            a.startsWith(w) ||                  // answer starts with dict word
            levenshtein(w, a) <= 2             // allow 2 character typo difference
        );
    });
}

// Levenshtein distance for typo tolerance
function levenshtein(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    if (Math.abs(a.length - b.length) > 3) return 99; // too different

    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

export function getCategories(): string[] {
    return Object.keys(dictionaries);
}