import { getRecipesForCharacter } from '../recipes/index.js';

function buildTable(characterId) {
    const table = {};
    for (const recipe of getRecipesForCharacter(characterId)) {
        table[[...recipe.sigils].sort().join('+')] = {
            name: recipe.name,
            mode: recipe.mode,
            cast: recipe.ability
        };
    }
    return Object.freeze(table);
}

export const SIGIL_RECIPES = Object.freeze({
    ingor: buildTable('ingor'),
    criac: buildTable('criac')
});

export function getSigilRecipe(characterId, sigils = []) {
    const key = [...sigils].sort().join('+');
    const table = SIGIL_RECIPES[characterId] ?? SIGIL_RECIPES.ingor;
    return table[key] ?? {
        name: sigils.length ? 'Нестабильная магия' : 'Добавьте сигилы',
        mode: 'invalid',
        cast: null
    };
}
