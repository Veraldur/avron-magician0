import { CharacterSystem } from '../system/CharacterSystem.js';

export class Player {
    constructor(scene, options = {}) {
        this.scene = scene;

        const characterId = CharacterSystem.resolve(
            options.characterId ??
            scene.registry?.get('selectedCharacterId') ??
            scene.registry?.get('characterId') ??
            'ingor'
        );

        this.characterId = characterId;
        this.character = CharacterSystem.get(characterId);
        this.stats = { ...this.character.stats };

        this.sigils = [...this.character.sigils.initial];
        this.selectedSigils = [];

        this.spawnX = options.x ?? 260;
        this.surfaceY = options.surfaceY ?? 100;

        this.body = null;
        this.sprite = null;

        this.animation = {
            state: 'idle',
            frame: 1,
            timer: 0
        };

        this.createBody();
        this.createVisual();
        this.applyRuntimeState();
    }

    createBody() {
        const scene = this.scene;
        const config = scene.CONFIG.PLAYER;
        const bodyWidth = this.stats.bodyWidth ?? config.bodyWidth;
        const bodyHeight = this.stats.bodyHeight ?? config.bodyHeight;

        this.bodyObject = scene.add.rectangle(
            this.spawnX,
            this.surfaceY - bodyHeight / 2,
            bodyWidth,
            bodyHeight,
            0xffffff,
            0
        );

        scene.physics.add.existing(this.bodyObject);

        this.body = this.bodyObject;

        this.body.body.setCollideWorldBounds(false);
        this.body.body.setGravityY(
            this.stats.gravity ?? config.gravity
        );
        this.body.body.setSize(bodyWidth, bodyHeight);

        this.body.facing = 1;

        this.body.dashUntil = 0;
        this.body.dashVelocityX = 0;
        this.body.isDashing = false;
        this.body.isInvulnerable = false;
        this.body.dashEndTimer = null;

        this.body.canDoubleJump = false;
        this.body.canDash = false;

        this.body.isDropping = false;
        this.body.dropThroughPlatform = null;

        this.body.lastAttack = 0;
        this.body.invulnerableUntil = 0;
        this.body.isInvisible = false;

        this.body.maxHP = this.stats.maxHP;

        this.body.jumpAnimation = 'normal';

        this.body.characterId = this.characterId;
        this.body.player = this;
    }

    createVisual() {
        const visual = this.character.visual;

        if (!visual) {
            throw new Error(
                `Character "${this.characterId}" has no visual configuration.`
            );
        }

        this.sprite = this.scene.add.image(
            this.body.x,
            this.body.y,
            visual.idle1
        );

        this.sprite
            .setDisplaySize(
                this.stats.visualWidth ?? 58,
                this.stats.visualHeight ?? 76
            )
            .setOrigin(0.5, 1);

        if (
            visual.tint !== undefined &&
            visual.tint !== 0xffffff
        ) {
            this.sprite.setTint(visual.tint);
        }
    }

    applyRuntimeState() {
        this.body.maxHP = this.stats.maxHP;
        this.body.playerStats = this.stats;
    }

    getCharacterId() {
        return this.characterId;
    }

    getSigils() {
        return [...this.sigils];
    }

    emitAction(action, data = {}) {
        this.scene?.eventBus?.emit(`tutorial:${action}`, { action, player: this, ...data });
    }

    hasSigil(id) {
        return this.sigils.includes(id);
    }

    addSigil(id) {
        if (!id || this.sigils.includes(id)) {
            return false;
        }

        if (
            this.sigils.length >=
            this.character.sigils.max
        ) {
            return false;
        }

        this.sigils.push(id);
        return true;
    }

    removeSigil(id) {
        const index = this.sigils.indexOf(id);

        if (index < 0) {
            return false;
        }

        this.sigils.splice(index, 1);

        this.selectedSigils =
            this.selectedSigils.filter(
                sigilId => sigilId !== id
            );

        return true;
    }

    setSigils(ids) {
        if (!Array.isArray(ids)) {
            return;
        }

        const valid = ids.filter(
            id => !this.sigils.includes(id)
        );

        for (const id of valid) {
            if (
                this.sigils.length >=
                this.character.sigils.max
            ) {
                break;
            }

            this.sigils.push(id);
        }
    }

    clearSelectedSigils() {
        this.selectedSigils.length = 0;
    }

    selectSigil(id) {
        if (!this.hasSigil(id)) {
            return false;
        }

        if (this.selectedSigils.length >= 3) {
            this.selectedSigils.shift();
        }

        this.selectedSigils.push(id);

        return true;
    }

    getVisualKey(state = 'idle') {
        const visual = this.character.visual;

        if (!visual) {
            return null;
        }

        switch (state) {
            case 'walk':
                return visual.walk1;

            case 'jump1':
                return visual.jump1;

            case 'jump2':
                return visual.jump2;

            case 'idle':
            default:
                return visual.idle1;
        }
    }

    update() {
        if (!this.body?.body) {
            return;
        }

        this.syncVisual();
    }

    updateAnimation(delta = 16) {
        if (!this.body?.body || !this.sprite) {
            return;
        }

        const body = this.body.body;

        let state = 'idle';

        if (!body.blocked.down) {
            if (
                body.velocity.y < 0
            ) {
                state = 'jump1';
            } else {
                state = 'jump2';
            }
        } else if (
            Math.abs(body.velocity.x) > 10
        ) {
            state = 'walk';
        }

        this.animation.timer += delta;

        if (
            state !== this.animation.state ||
            this.animation.timer >= 180
        ) {
            this.animation.timer = 0;

            if (state === 'walk') {
                this.animation.frame =
                    this.animation.frame === 1
                        ? 2
                        : 1;
            } else {
                this.animation.frame = 1;
            }

            this.animation.state = state;

            const visual =
                this.character.visual;

            let textureKey;

            if (state === 'walk') {
                textureKey =
                    this.animation.frame === 1
                        ? visual.walk1
                        : visual.walk2;
            } else if (state === 'jump1') {
                textureKey = visual.jump1;
            } else if (state === 'jump2') {
                textureKey = visual.jump2;
            } else {
                textureKey =
                    this.animation.frame === 1
                        ? visual.idle1
                        : visual.idle2;
            }

            if (
                textureKey &&
                this.scene.textures.exists(textureKey)
            ) {
                this.sprite.setTexture(textureKey);
            }
        }

        this.syncVisual();
    }

    syncVisual() {
        if (
            !this.body?.body ||
            !this.sprite
        ) {
            return;
        }

        this.sprite.x = this.body.x;
        this.sprite.y = this.body.body.bottom;

        this.sprite.setFlipX(
            this.body.facing < 0
        );

        this.sprite.setVisible(
            !this.body.isInvisible
        );
    }

    respawn() {
        if (!this.body?.body) {
            return;
        }

        const bodyHeight = this.stats.bodyHeight ?? this.scene.CONFIG.PLAYER.bodyHeight;
        this.body.body.reset(
            this.spawnX,
            this.surfaceY - bodyHeight / 2
        );

        this.body.body.setVelocity(0, 0);

        this.body.isDashing = false;
        this.body.dashUntil = 0;
        this.body.dashVelocityX = 0;

        this.body.isInvulnerable = false;
        this.body.invulnerableUntil = 0;

        this.body.isInvisible = false;
        this.body.canDoubleJump = false;
        this.body.canDash = false;

        this.body.jumpAnimation = 'normal';

        this.syncVisual();
    }

    destroy() {
        if (this.body?.active) {
            this.body.destroy();
        }

        if (this.sprite?.active) {
            this.sprite.destroy();
        }

        this.body = null;
        this.sprite = null;
    }
}

export default Player;