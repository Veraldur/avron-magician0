export class CombatSystem {
    constructor(scene) {
        this.scene = scene;
        this.state = 'idle';
        this.type = null;
        this.startedAt = 0;
        this.hitAt = 0;
        this.endAt = 0;
        this.didHit = false;
        this.chargeStartedAt = 0;
        this.chargeFx = null;
        this.nextUpHitAt = 0;
        this.upHitIds = new Map();
    }

    beginCharge(time) {
        if (this.state !== 'idle') {
            // Обычную атаку можно мгновенно прервать новым нажатием.
            // Это даёт настоящий spam-click без искусственного cooldown.
            if (this.type === 'normal' || this.type === 'move' || this.state === 'startup' || this.state === 'active') {
                this.reset();
            } else {
                return false;
            }
        }
        if (!this.scene?.playerBody?.active) return false;
        if (this.scene.isPaused || this.scene.gameOver) return false;
        this.state = 'charging';
        this.chargeStartedAt = time;
        this.createChargeFx();
        return true;
    }

    releaseAttack(time) {
        if (this.state !== 'charging') return false;
        const held = time - this.chargeStartedAt;
        const attack = this.resolveAttackType(held);
        this.startAttack(attack, time);
        this.destroyChargeFx();
        return true;
    }

    resolveAttackType(held) {
        const keys = this.scene.keys ?? {};
        const strongThreshold = 1000;
        if (held >= strongThreshold) return 'strong';
        if (keys.up?.isDown) return 'up';
        if (keys.left?.isDown || keys.right?.isDown) return 'move';
        return 'normal';
    }

    getProfile(type) {
        const cfg = this.scene.CONFIG?.ATTACK ?? {};
        const defaults = {
            normal: { startup: 35, duration: 300, damage: 2, width: 155, height: 115, offsetX: 92 },
            move: { startup: 35, duration: 360, damage: 2, width: 165, height: 115, offsetX: 100, lungeSpeed: 560 },
            up: { startup: 45, upDuration: 700, damage: 2, width: 120, height: 125, verticalOffset: 82, jumpVelocity: 720, repeatHitMs: 70 },
            strong: { startup: 90, duration: 1000, damage: 4, radius: 190, knockbackY: -120, width: 190, height: 135, offsetX: 105 }
        };
        return cfg.profiles?.[type] ?? cfg.profiles?.normal ?? defaults[type] ?? defaults.normal;
    }

    startAttack(type, time) {
        if (this.state !== 'charging' && this.state !== 'idle') return false;

        const profile = this.getProfile(type);
        this.state = 'startup';
        this.type = type;
        this.startedAt = time;
        this.hitAt = time + (profile.startup ?? 70);
        // Визуальная длительность attack_2 и attack_4 — ровно 1 секунда,
        // если игрок ничего нового не нажимает. Это намеренно длиннее старого recovery.
        this.endAt = type === 'up'
            ? time + (profile.upDuration ?? 700)
            : time + (profile.duration ?? 1000);
        this.didHit = false;
        this.nextUpHitAt = this.hitAt;
        this.upHitIds.clear();

        const body = this.scene.playerBody?.body;
        if (body && type === 'move') {
            const direction = this.scene.playerBody.facing || 1;
            body.setVelocityX(direction * (profile.lungeSpeed ?? 420));
        }

        if (body && type === 'up') {
            this.scene.playerBody.jumpAnimation = 'ability';
            body.setVelocityY(-(profile.jumpVelocity ?? profile.lungeLift ?? 720));
            this.scene.playerBody.canDoubleJump = true;
        }

        return true;
    }

    update(time) {
        if (this.state === 'idle') return;
        if (this.state === 'charging') {
            const held = time - this.chargeStartedAt;
            if (held >= 1000 && !this.chargeFx?.active) this.createChargeFx();
            if (held >= 1000) this.updateChargeFx(time);
            return;
        }
        if (!this.scene.playerBody?.active) {
            this.reset();
            return;
        }

        const body = this.scene.playerBody.body;
        const profile = this.getProfile(this.type);

        if (body && this.type === 'move' && time < this.endAt) {
            body.setVelocityX((this.scene.playerBody.facing || 1) * (profile.lungeSpeed ?? 420));
        }

        if (!this.didHit && time >= this.hitAt) {
            this.state = 'active';
            this.didHit = true;
            this.performHit(time);
        }

        // Верхняя атака продолжается всё время, пока персонаж летит вверх.
        if (this.type === 'up' && this.state === 'active') {
            const stillRising = body && body.velocity.y < 30;
            if (stillRising && time >= this.nextUpHitAt) {
                this.performHit(time);
                this.nextUpHitAt = time + (profile.repeatHitMs ?? 70);
            }
            if (profile.hitUntilLanding && body?.blocked?.down && time > this.hitAt + 80) {
                this.reset();
                return;
            }
        }

        if (time >= this.endAt) this.reset();
    }

    performHit(time = this.scene.time.now) {
        const scene = this.scene;
        const body = scene.playerBody;
        if (!body?.active) return;

        const direction = body.facing || 1;
        const playerX = body.x;
        const playerY = body.body?.center?.y ?? body.y;
        const profile = this.getProfile(this.type);
        const damageMultiplier = body.form === 'super'
            ? (scene.CONFIG.SUPER?.damageMultiplier ?? 2)
            : 1;

        if (this.type === 'strong') {
            const radius = (profile.radius ?? 190) * (body.form === 'super' ? 1.35 : 1);
            this.drawExplosionFrame(playerX, playerY, radius);
            for (const enemy of scene.enemies?.getChildren?.() ?? []) {
                if (!enemy?.active || enemy.stageIndex !== scene.currentStageIndex) continue;
                if (Phaser.Math.Distance.Between(playerX, playerY, enemy.x, enemy.body?.center?.y ?? enemy.y) > radius) continue;
                scene.hitEnemy(enemy, {
                    damage: Math.round((profile.damage ?? 4) * damageMultiplier),
                    knockbackX: (profile.knockbackX ?? 0) * direction,
                    knockbackY: profile.knockbackY ?? 0,
                    hitStun: profile.hitStun ?? scene.CONFIG.ATTACK.hitStun,
                    hitstop: profile.hitstop ?? 40,
                    shake: profile.shake ?? 4
                });
            }
            return;
        }

        let hitX = playerX + direction * (profile.offsetX ?? 72);
        let hitY = playerY + (profile.offsetY ?? 0);
        if (this.type === 'up') {
            hitX = playerX;
            hitY = playerY - (profile.verticalOffset ?? 82);
        }

        const hitWidth = profile.width ?? 130;
        const hitHeight = profile.height ?? 105;
        const rect = new Phaser.Geom.Rectangle(
            hitX - hitWidth / 2,
            hitY - hitHeight / 2,
            hitWidth,
            hitHeight
        );

        for (const enemy of scene.enemies?.getChildren?.() ?? []) {
            if (!enemy?.active || enemy.stageIndex !== scene.currentStageIndex) continue;
            if (!Phaser.Geom.Intersects.RectangleToRectangle(rect, enemy.getBounds())) continue;

            if (this.type === 'up') {
                const last = this.upHitIds.get(enemy) ?? -Infinity;
                if (time - last < (profile.repeatHitMs ?? 70)) continue;
                this.upHitIds.set(enemy, time);
            }

            scene.hitEnemy(enemy, {
                damage: Math.round((profile.damage ?? 1) * damageMultiplier),
                knockbackX: (profile.knockbackX ?? 0) * direction,
                knockbackY: profile.knockbackY ?? 0,
                hitStun: profile.hitStun ?? scene.CONFIG.ATTACK.hitStun,
                hitstop: profile.hitstop ?? 24,
                shake: profile.shake ?? 2
            });
        }
    }

    // Визуальную дугу/прямоугольник hitbox больше не рисуем.
    // Урон считается по геометрии выше, но поверх персонажа никаких
    // отладочных квадратов и дуг не появляется.
    drawAttackFrame() {}

    drawExplosionFrame(x, y, radius) {
        const scene = this.scene;
        const core = scene.add.circle(x, y, 28, 0x78d7ff, 0.28)
            .setStrokeStyle(5, 0xdff8ff, 0.9)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDepth(24);
        const ring = scene.add.circle(x, y, 18, 0x78d7ff, 0)
            .setStrokeStyle(8, 0x78d7ff, 0.85)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDepth(24);
        scene.tweens.add({
            targets: [core, ring],
            scaleX: radius / 28,
            scaleY: radius / 28,
            alpha: 0,
            duration: 260,
            ease: 'Cubic.Out',
            onComplete: () => { core.destroy(); ring.destroy(); }
        });
        scene.cameras.main.shake(90, 0.004);
    }

    createChargeFx() {
        const scene = this.scene;
        if (this.chargeFx?.active) return;
        this.chargeFx = scene.add.circle(0, 0, 22, 0xffd27a, 0.14)
            .setStrokeStyle(3, 0xffd27a, 0.75)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDepth(24);
    }

    updateChargeFx(time) {
        if (!this.chargeFx?.active) return;
        const body = this.scene.playerBody;
        this.chargeFx.x = body?.x ?? 0;
        this.chargeFx.y = (body?.body?.center?.y ?? body?.y ?? 0) - 48;
        const held = time - this.chargeStartedAt;
        const threshold = 1000;
        const progress = Phaser.Math.Clamp(held / threshold, 0, 1);
        this.chargeFx.setScale(0.8 + progress * 0.9);
        this.chargeFx.setAlpha(0.14 + progress * 0.35);
    }

    destroyChargeFx() {
        if (this.chargeFx?.active) this.chargeFx.destroy();
        this.chargeFx = null;
    }

    reset() {
        this.state = 'idle';
        this.type = null;
        this.didHit = false;
        this.nextUpHitAt = 0;
        this.upHitIds.clear();
        this.destroyChargeFx();
    }

    destroy() {
        this.reset();
        this.scene = null;
    }
}

export default CombatSystem;
