import { CHARACTERS, getCharacterData } from '../data/characters/index.js';

export class CharacterSystem {
    static get(id) { return getCharacterData(id); }
    static resolve(id) { return this.get(id).id; }
    static all() { return Object.values(CHARACTERS); }
    static select(scene, id) {
        const character = this.get(id);
        scene.registry.set('selectedCharacterId', character.id);
        scene.registry.set('characterId', character.id);
        return character;
    }
}

export default CharacterSystem;
