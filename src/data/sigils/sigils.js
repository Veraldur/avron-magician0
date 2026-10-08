export const SIGILS = Object.freeze({
    flame: { id: 'flame', name: 'Пламя', icon: 'sigil_flame', availableTo: ['ingor'] },
    shadow: { id: 'shadow', name: 'Тень', icon: 'sigil_shadow', availableTo: ['ingor'] },
    ether: { id: 'ether', name: 'Эфир', icon: 'sigil_ether', availableTo: ['ingor'] },
    gravis: { id: 'gravis', name: 'Гравис', icon: 'sigil_gravis', availableTo: ['ingor'] },
    water: { id: 'water', name: 'Вода', icon: 'sigil_water', availableTo: ['criac'] },
    light: { id: 'light', name: 'Свет', icon: 'sigil_light', availableTo: ['criac'] },
    time: { id: 'time', name: 'Время', icon: 'sigil_time', availableTo: ['criac'] }
});

export function getSigil(id) {
    return SIGILS[id] ?? null;
}

export function hasSigil(id) {
    return Boolean(SIGILS[id]);
}

export function getSigilsForCharacter(characterId) {
    return Object.values(SIGILS).filter(sigil => sigil.availableTo.includes(characterId));
}

export default SIGILS;
