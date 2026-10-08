import { getRecipesForCharacter } from '../data/recipes/index.js';
import { getCharacterData } from '../data/characters/index.js';

function normalizeRecipe(recipe) {
    const sigils = [...(recipe?.sigils ?? [])];
    return {
        ...recipe,
        key: [...sigils].sort().join('+'),
        ability: recipe?.ability ?? recipe?.cast ?? null
    };
}

export class RecipeSystem {
    constructor(characterId = 'ingor') {
        this.setCharacter(characterId);
    }

    setCharacter(characterId) {
        this.characterId = getCharacterData(characterId).id;
        return this;
    }

    getAll() {
        return getRecipesForCharacter(this.characterId).map(normalizeRecipe);
    }

    find(selected, available = []) {
        if (!selected?.length) return null;
        const allowed = new Set(available);
        if (selected.some(id => !allowed.has(id))) return null;
        const key = [...selected].sort().join('+');
        return this.getAll().find(recipe => recipe.key === key) ?? null;
    }

    getAvailableSigils() {
        return [...(getCharacterData(this.characterId).sigils?.initial ?? [])];
    }
}

export { normalizeRecipe };
export default RecipeSystem;
