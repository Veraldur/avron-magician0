export class SuperSystem {
    constructor(scene) {
        this.scene = scene;
        this.meter = 0;
        this.active = false;
        this.until = 0;
        this.aura = null;
        this.nextAuraHit = 0;
        this.baseTint = scene?.characterData?.visual?.tint ?? 0xffffff;
    }

    add(amount, options = {}) {
        this.meter = Phaser.Math.Clamp(
            this.meter + amount,
            0,
            this.scene.CONFIG.SUPER?.meterMax ?? 100
        );
        if (options.updateUI !== false && this.scene?.sys?.isActive?.()) {
            this.scene.updateUI?.();
        }
    }

    canActivate() {
        return !this.active && this.meter >= (this.scene.CONFIG.SUPER?.meterMax ?? 100);
    }

    activate() {
        if (!this.canActivate()) return false;
        const scene = this.scene;
        const body = scene.playerBody;
        if (!body?.active) return false;

        this.active = true;
        this.until = scene.time.now + (scene.CONFIG.SUPER?.duration ?? 8000);
        this.nextAuraHit = scene.time.now;
        this.meter = 0;
        body.form = 'super';
        body.superFormUntil = this.until;
        body.superStartedAt = scene.time.now;
        body.isSuperInvulnerable = true;
        scene.playerSprite?.setTint(0xffe29a);
        const baseW = scene.player?.stats?.visualWidth ?? scene.CONFIG.PLAYER.visualWidth ?? 58;
        const baseH = scene.player?.stats?.visualHeight ?? scene.CONFIG.PLAYER.visualHeight ?? 76;
        if (scene.playerSprite) scene.playerSprite.setDisplaySize(baseW * 1.12, baseH * 1.12);

        if (scene.textures?.exists?.('player_aura')) {
            this.aura = scene.add.image(0, 0, 'player_aura')
                .setDisplaySize(baseW * 1.32, baseH * 1.32)
                .setAlpha(0.82)
                .setBlendMode(Phaser.BlendModes.ADD)
                .setOrigin(0.5, 1)
                .setDepth(19);
        } else {
            this.aura = scene.add.circle(0, 0, 54, 0xffd27a, 0.14)
                .setStrokeStyle(5, 0xfff0a0, 0.9)
                .setBlendMode(Phaser.BlendModes.ADD)
                .setDepth(19);
        }

        scene.showArenaMessage?.('СУПЕРФОРМА — АТАКИ УСИЛЕНЫ');
        scene.updateUI?.();
        return true;
    }

    update(time) {
        if (!this.active) return;
        const scene = this.scene;
        const body = scene.playerBody;

        if (!body?.active || time >= this.until) {
            this.deactivate();
            return;
        }

        if (this.aura?.active) {
            this.aura.x = body.x;
            this.aura.y = body.body?.center?.y ?? body.y;
            const pulse = 1 + Math.sin(time / 80) * 0.12;
            this.aura.setScale(pulse);
        }

        const tick = scene.CONFIG.SUPER?.auraTick ?? 260;
        if (time >= this.nextAuraHit) {
            this.nextAuraHit = time + tick;
            const radius = scene.CONFIG.SUPER?.auraRadius ?? 125;
            const damage = scene.CONFIG.SUPER?.auraDamage ?? 2;
            for (const enemy of scene.enemies?.getChildren?.() ?? []) {
                if (!enemy?.active || enemy.stageIndex !== scene.currentStageIndex) continue;
                const distance = Phaser.Math.Distance.Between(
                    body.x,
                    body.body?.center?.y ?? body.y,
                    enemy.x,
                    enemy.body?.center?.y ?? enemy.y
                );
                if (distance <= radius) {
                    scene.hitEnemy(enemy, {
                        damage,
                        knockbackX: 0,
                        knockbackY: -80,
                        hitStun: 160,
                        hitstop: 15,
                        shake: 1
                    });
                }
            }
        }
    }

    deactivate(options = {}) {
        this.active = false;
        this.until = 0;
        this.nextAuraHit = 0;

        if (this.scene.playerBody) {
            this.scene.playerBody.form = 'normal';
            this.scene.playerBody.superFormUntil = 0;
            this.scene.playerBody.isSuperInvulnerable = false;
        }

        // При обычном завершении суперформы восстанавливаем обычный спрайт.
        // При shutdown сцены НЕ трогаем TextureManager: Phaser уже разбирает Scene.sys.
        if (!this.scene?.isCleaningUp && this.scene?.sys?.isActive?.() && this.scene?.playerSprite?.active) {
            const textureKey = this.scene.resolvePlayerTexture?.(
                this.scene.characterData?.visual?.idle1,
                this.scene.characterData?.visual?.fallback ?? 'ingor_walk_2'
            );
            if (textureKey && this.scene.textures?.exists?.(textureKey)) {
                this.scene.playerSprite.clearTint();
                this.scene.playerSprite.setTexture(textureKey);
                if (this.baseTint !== 0xffffff) this.scene.playerSprite.setTint(this.baseTint);
                const baseW = this.scene.player?.stats?.visualWidth ?? this.scene.CONFIG.PLAYER.visualWidth ?? 58;
                const baseH = this.scene.player?.stats?.visualHeight ?? this.scene.CONFIG.PLAYER.visualHeight ?? 76;
                this.scene.playerSprite.setDisplaySize(baseW, baseH);
            }
        }

        if (this.aura) {
            this.aura.destroy();
            this.aura = null;
        }
        if (options.updateUI !== false && !this.scene?.isCleaningUp && this.scene?.sys?.isActive?.()) {
            this.scene.updateUI?.();
        }
    }

    destroy() {
        // Scene shutdown: только освобождаем собственные объекты.
        // Нельзя вызывать deactivate(), потому что setTexture() уже может обращаться
        // к уничтоженному Phaser TextureManager.
        if (this.aura) {
            this.aura.destroy();
            this.aura = null;
        }
        this.active = false;
        this.until = 0;
        this.nextAuraHit = 0;
        this.scene = null;
    }
}

export default SuperSystem;
