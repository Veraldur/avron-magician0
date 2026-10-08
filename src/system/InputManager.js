import { CONTROLS } from '../../config/controlConfig.js';
import { getControls } from './SaveSystem.js';

export class InputManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        const K = Phaser.Input.Keyboard.KeyCodes;
        const controls = { ...CONTROLS, ...getControls() };

        this.keys = {
            left: scene.input.keyboard.addKey(K[controls.left]),
            right: scene.input.keyboard.addKey(K[controls.right]),
            down: scene.input.keyboard.addKey(K[controls.down]),
            jump: scene.input.keyboard.addKey(K[controls.jump]),
            attack: scene.input.keyboard.addKey(K[controls.attack]),
            clear: scene.input.keyboard.addKey(K[controls.clear]),
            restart: scene.input.keyboard.addKey(K[controls.restart]),
            up: scene.input.keyboard.addKey(K[controls.up]),
            attackAlt: scene.input.keyboard.addKey(K[controls.attackAlt]),
            cast: scene.input.keyboard.addKey(K[controls.cast ?? 'CTRL'])
        };

        this.sigilKeys = {};

        const playerSigils = player.getSigils();
        const characterControls = player.character?.controls ?? {};

        for (const sigilId of playerSigils) {
            // Персонаж сам определяет, какой логический control используется
            // для его сигила. Это важно для Криака: water=Z, light=X, time=V.
            const controlName = characterControls[sigilId] ?? sigilId;
            const controlCodeName = controls[controlName] ?? controlName.toUpperCase();
            const keyCode = K[controlCodeName];

            if (!keyCode) continue;
            this.sigilKeys[sigilId] = scene.input.keyboard.addKey(keyCode);
        }

        // Совместимость со старым MainScene.
        this.keys.flame = this.sigilKeys.flame ?? null;
        this.keys.shadow = this.sigilKeys.shadow ?? null;
        this.keys.ether = this.sigilKeys.ether ?? null;
        this.keys.gravis = this.sigilKeys.gravis ?? null;

        this.destroyed = false;
    }

    getPressedSigils() {
        if (this.destroyed) return [];

        const result = [];

        for (const [sigilId, key] of Object.entries(this.sigilKeys)) {
            if (key && Phaser.Input.Keyboard.JustDown(key)) {
                result.push(sigilId);
            }
        }

        return result;
    }

    destroy() {
        this.destroyed = true;
        this.sigilKeys = {};
        this.keys = {};
    }
}

export default InputManager;
