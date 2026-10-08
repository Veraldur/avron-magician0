import { ABILITIES } from '../mechanics/abilities.js';

export class AbilitySystem {
    static cast(scene, player, recipe) {
        if (!scene || !player || !recipe?.ability) {
            return false;
        }

        const ability = ABILITIES[recipe.ability];

        if (typeof ability !== 'function') {
            console.warn(`Unknown ability: ${recipe.ability}`);
            return false;
        }

        ability(scene, player.body);
        return true;
    }
}

export default AbilitySystem;