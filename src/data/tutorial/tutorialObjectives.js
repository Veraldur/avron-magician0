import { getCharacterData } from '../characters/index.js';

const SIGIL_LABELS = {
    flame: 'Пламя',
    shadow: 'Тень',
    ether: 'Эфир',
    gravis: 'Гравис',
    water: 'Вода',
    light: 'Свет',
    time: 'Время'
};

const KEY_LABELS = {
    flame: 'Z',
    shadow: 'X',
    ether: 'C',
    gravis: 'V',
    water: 'Z',
    light: 'X',
    time: 'V'
};

function controlKeyForSigil(sigil, inputControls, characterId) {
    const character = getCharacterData(characterId ?? 'ingor');
    const controlName = character?.controls?.[sigil] ?? sigil;
    return inputControls[controlName] ?? inputControls[sigil] ?? KEY_LABELS[sigil] ?? sigil.toUpperCase();
}

function recipeInputText(recipe, inputControls, sequence = recipe.sigils) {
    const keys = sequence.map(id => controlKeyForSigil(id, inputControls, inputControls.characterId));
    return recipe.mode === 'auto' ? keys.join(' → ') : `${keys.join(' → ')} → ${inputControls.cast ?? 'CTRL'}`;
}

function keyRank(key) {
    const order = ['Z', 'X', 'C', 'V'];
    const i = order.indexOf(String(key).toUpperCase());
    return i < 0 ? 99 : i;
}

function safeRecipeSequence(recipe, allRecipes, inputControls) {
    const original = [...recipe.sigils];
    if (original.length < 3) return original;

    // In the live game ZZ/XX/CC/VV are auto-cast immediately. If a longer
    // recipe starts with such a pair, the tutorial must give a sequence that
    // cannot trigger the shorter auto recipe first. Rotation preserves the
    // same multiset of sigils and lets the RecipeSystem resolve it.
    const autoPairs = new Set(
        allRecipes.filter(r => r.mode === 'auto' && r.sigils.length === 2 && r.sigils[0] === r.sigils[1])
            .map(r => r.sigils[0])
    );
    if (original.length >= 3 && original[0] === original[1] && autoPairs.has(original[0])) {
        // Показываем последний сигил первым: например XXV становится VXX.
        // Так последовательность очевидна игроку и никогда не запускает XX
        // как отдельную авто-способность до ввода третьего сигила.
        const rotated = [original.at(-1), ...original.slice(0, -1)];
        if (!(rotated[0] === rotated[1] && autoPairs.has(rotated[0]))) return rotated;
    }
    return original;
}

export function createTutorialObjectives(recipeSystem, controls = {}) {
    const inputControls = { ...controls, characterId: recipeSystem?.characterId ?? controls.characterId };
    const recipes = recipeSystem?.getAll?.() ?? [];
    const objectives = [
        { id: 'move', action: 'move', title: 'Движение', description: 'Переместитесь влево или вправо.', required: 1 },
        { id: 'jump', action: 'jump', title: 'Прыжок', description: `Нажмите ${inputControls.jump ?? 'SPACE'} и прыгните.`, required: 1 },
        { id: 'attack', action: 'attack', title: 'Обычная атака', description: `Атакуйте противника клавишей ${inputControls.attack ?? 'DELETE'}.`, required: 1 }
    ];

    const decorated = recipes.map((recipe, index) => {
        const sequence = safeRecipeSequence(recipe, recipes, inputControls);
        const keys = sequence.map(id => controlKeyForSigil(id, inputControls, inputControls.characterId));
        return { recipe, sequence, keys, index };
    });

    decorated.sort((a, b) => {
        const ak = a.keys.map(keyRank), bk = b.keys.map(keyRank);
        for (let i = 0; i < Math.max(ak.length, bk.length); i++) {
            const d = (ak[i] ?? -1) - (bk[i] ?? -1);
            if (d) return d;
        }
        return a.sequence.length - b.sequence.length || a.index - b.index;
    });

    for (const { recipe, sequence } of decorated) {
        const labels = sequence.map(id => SIGIL_LABELS[id] ?? id).join(' + ');
        objectives.push({
            id: `ability_${recipe.id ?? recipe.key}`,
            action: recipe.ability,
            title: recipe.name,
            description: `${labels}: ${recipeInputText(recipe, inputControls, sequence)}.`,
            required: 1,
            tutorialSequence: sequence
        });
    }
    return objectives;
}

export const TUTORIAL_OBJECTIVES = createTutorialObjectives({ getAll: () => [] });

// Совместимость для кода/инструментов, которые ещё импортируют старую константу.
