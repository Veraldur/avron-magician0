export const CHARACTERS = Object.freeze({
    ingor: {
        id: 'ingor', name: 'Ингор', description: 'Повелитель пламени и теней.',
        stats: { speed: 300, jumpVelocity: 850, maxHP: 100, dashMultiplier: 1, bodyWidth: 42, bodyHeight: 74, visualWidth: 58, visualHeight: 78, gravity: 1350 },
        sigils: { initial: ['flame','shadow','ether','gravis'] },
        controls: { flame:'sigil1', shadow:'sigil2', ether:'sigil3', gravis:'sigil4' },
        visual: {
            idle1:'ingor_idle_1', idle2:'ingor_idle_2', walk1:'ingor_walk_1', walk2:'ingor_walk_2',
            jump1:'ingor_jump_1', jump2:'ingor_jump_2', attack1:'ingor_walk_2', attack2:'ingor_walk_2', attack3:'ingor_walk_2', attack4:'ingor_walk_2',
            cast1:'ingor_walk_2', cast2:'ingor_walk_2', aura:'ingor_walk_2', fallback:'ingor_walk_2',
            tint:0xffffff
        }
    },
    criac: {
        id: 'criac', name: 'Криак', description: 'Воин воды, света, эфира и времени.',
        stats: { speed: 315, jumpVelocity: 880, maxHP: 110, dashMultiplier: 1.08, bodyWidth: 42, bodyHeight: 74, visualWidth: 58, visualHeight: 78, gravity: 1350 },
        sigils: { initial: ['water','light','ether','time'], max: 4 },
        controls: { water:'sigil1', light:'sigil2', ether:'sigil3', time:'sigil4' },
        visual: {
            idle1:'criac_idle_1', idle2:'criac_idle_2', walk1:'criac_walk_1', walk2:'criac_walk_2',
            jump1:'criac_jump_1', jump2:'criac_jump_2', attack1:'criac_attack_1', attack2:'criac_attack_2', attack3:'criac_attack_3', attack4:'criac_attack_4',
            cast1:'criac_cast_1', cast2:'criac_cast_2', aura:'criac_aura', fallback:'criac_walk_2',
            tint:0xffffff
        }
    }
});

export function getCharacterData(id) { return CHARACTERS[id] ?? CHARACTERS.ingor; }
export function getCharacter(id) { return getCharacterData(id); }
export function hasCharacter(id) { return Boolean(CHARACTERS[id]); }
