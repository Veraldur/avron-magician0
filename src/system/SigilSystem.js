import { getSigil } from '../data/sigils/sigils.js';

export class SigilSystem {
    constructor(player) {
        this.player = player;
    }

    getAvailable() {
        return this.player.getSigils();
    }

    getDefinitions() {
        return this.getAvailable()
            .map(id => getSigil(id))
            .filter(Boolean);
    }

    canUse(id) {
        return this.player.hasSigil(id);
    }

    addToCast(id) {
        if (!this.canUse(id)) return false;
        return this.player.selectSigil(id);
    }

    clearCast() {
        this.player.clearSelectedSigils();
    }

    getCast() {
        return [...this.player.selectedSigils];
    }
}