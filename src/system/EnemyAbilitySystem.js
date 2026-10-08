export class EnemyAbilitySystem {

    constructor(scene, enemySystem) {
        this.scene = scene;
        this.enemySystem = enemySystem;
        this.projectiles = enemySystem.projectiles;
    }

    canUse(enemy, ability) {
        if (!enemy?.active || !ability) {
            return false;
        }

        const now = this.scene.time.now;

        if (
            now <
            (enemy.enemyAbilityCooldowns?.[ability.id] ?? 0)
        ) {
            return false;
        }

        const dx =
            this.scene.playerBody.x -
            enemy.x;

        const dy =
            this.scene.playerBody.body.center.y -
            enemy.body.center.y;

        const distance =
            Math.hypot(dx, dy);

        const maxRange =
            ability.range ??
            enemy.abilityRange ??
            800;

        const minRange =
            ability.minRange ??
            0;

        if (distance > maxRange) {
            return false;
        }

        // Для projectile minRange теперь только опциональный фильтр.
        // Текущие стрелки/босс могут стрелять и вблизи.
        if (
            minRange > 0 &&
            distance < minRange &&
            ability.allowCloseRange !== true
        ) {
            return false;
        }

        return true;
    }

    tryUse(enemy, ability) {
        if (!this.canUse(enemy, ability)) {
            return false;
        }

        const now = this.scene.time.now;

        enemy.enemyAbilityCooldowns[ability.id] =
            now + (ability.cooldown ?? 1000);

        const handler =
            this.handlers[ability.id];

        if (typeof handler !== 'function') {
            return false;
        }

        handler.call(this, enemy, ability);

        enemy.lastAbilityAt = now;
        enemy.lastAbilityId = ability.id;

        return true;
    }

    update(enemy, abilities = []) {
        if (
            !enemy?.active ||
            !Array.isArray(abilities) ||
            abilities.length === 0
        ) {
            return false;
        }

        // Не кастуем несколько способностей одного врага
        // в один кадр.
        for (const ability of abilities) {
            if (this.tryUse(enemy, ability)) {
                return true;
            }
        }

        return false;
    }

    handlers = {

        fireball(enemy, ability) {
            this.spawnProjectile(
                enemy,
                ability,
                'fireball'
            );
        },

        etherShot(enemy, ability) {
            this.spawnProjectile(
                enemy,
                ability,
                'fireball'
            );
        },

        bossFireball(enemy, ability) {
            this.spawnProjectile(
                enemy,
                ability,
                'fireball'
            );
        },

        shadowBurst(enemy, ability) {
            const scene = this.scene;

            const x = enemy.x;
            const y = enemy.body.center.y;

            const radius =
                ability.radius ?? 180;

            this.createBurst(
                x,
                y,
                radius,
                0x8c5cff
            );

            if (
                Phaser.Math.Distance.Between(
                    x,
                    y,
                    scene.playerBody.x,
                    scene.playerBody.body.center.y
                ) <= radius
            ) {
                scene.damagePlayer(
                    ability.damage ?? 3
                );
            }
        },

        bossBurst(enemy, ability) {
            const scene = this.scene;

            const x = enemy.x;
            const y = enemy.body.center.y;

            const radius =
                ability.radius ?? 520;

            this.createBurst(
                x,
                y,
                radius,
                0xff4d6d
            );

            if (
                Phaser.Math.Distance.Between(
                    x,
                    y,
                    scene.playerBody.x,
                    scene.playerBody.body.center.y
                ) <= radius
            ) {
                scene.damagePlayer(
                    ability.damage ?? 12
                );
            }
        }
    };

    spawnProjectile(enemy, ability, texture) {
        const scene = this.scene;

        const player = scene.playerBody;

        const dx =
            player.x -
            enemy.x;

        const dy =
            player.body.center.y -
            enemy.body.center.y;

        const distance =
            Math.max(1, Math.hypot(dx, dy));

        const direction =
            Math.sign(dx) || enemy.facing || 1;

        const speed =
            ability.projectileSpeed ?? 500;

        const projectile =
            this.projectiles.create({
                x: enemy.x + direction * 30,
                y: enemy.body.center.y,
                direction,
                texture,
                size: ability.projectileSize ?? 24,
                damage: ability.damage ?? 1,
                speed,
                lifetime:
                    ability.projectileLifetime ??
                    2200,
                owner: enemy
            });

        // Если позже понадобится стрельба под углом,
        // данные уже позволяют это сделать.
        if (projectile?.body && dy !== 0) {
            const ratio =
                Phaser.Math.Clamp(
                    dy / distance,
                    -0.65,
                    0.65
                );

            projectile.body.setVelocity(
                direction * speed,
                ratio * speed
            );
        }

        return projectile;
    }

    createBurst(x, y, radius, color) {
        const scene = this.scene;

        const core = scene.add
            .circle(
                x,
                y,
                28,
                color,
                0.55
            )
            .setDepth(25);

        const ring = scene.add
            .circle(
                x,
                y,
                36,
                color,
                0
            )
            .setStrokeStyle(
                5,
                color,
                0.8
            )
            .setDepth(24);

        scene.tweens.add({
            targets: [core, ring],

            scaleX: radius / 28,
            scaleY: radius / 28,

            alpha: 0,

            duration: 320,

            ease: 'Cubic.Out',

            onComplete: () => {
                core.destroy();
                ring.destroy();
            }
        });
    }

    destroy() {}
}