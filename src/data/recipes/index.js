import { INGOR_RECIPES } from './ingorRecipes.js';
import { CRIAC_RECIPES } from './criacRecipes.js';

export const RECIPES = Object.freeze({
    ingor: INGOR_RECIPES,
    criac: CRIAC_RECIPES
});

export function getRecipesForCharacter(characterId) {
    return RECIPES[characterId] ?? RECIPES.ingor;
}
