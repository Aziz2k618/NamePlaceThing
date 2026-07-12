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

export function validateAnswer(
    category: string,
    letter: string,
    answer: string
): boolean {
    if (!answer || answer.trim().length === 0) return false;

    const dict = dictionaries[category];
    if (!dict) return true; // unknown category = benefit of doubt

    const wordList = dict[letter.toUpperCase()] || [];
    const cleanAnswer = answer.trim().toLowerCase();

    return wordList.some(word =>
        word.toLowerCase() === cleanAnswer
    );
}

export function getCategories(): string[] {
    return Object.keys(dictionaries);
}
