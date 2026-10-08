export class EnemyProjectileSystem {

    constructor(scene, enemySystem) {
        this.scene = scene;
        this.enemySystem = enemySystem;

        this.projectiles = scene.physics.add.group();
        this.projectileLifetimeTimers = new Set();

        // Совместимость с существующим кодом MainScene/abilities.js.
        scene.enemyProjectiles = this.projectiles;
    }

    create(options = {}) {
        const scene = this.scene;

        const {
            x = 0,
            y = 0,
            direction = 1,

            texture = 'fireball',

            size = 26,
            damage = 1,
            speed = 500,
            lifetime = 2000,

            gravity = 0,
            tint = null,

            owner = null,

            homing = false,
            homingStrength = 0
        } = options;

        let projectile;

        // Если текстуры нет, используем простой круг.
        if (scene.textures.exists(texture)) {
            projectile = scene.physics.add.image(
                x,
                y,
                texture
            );

            projectile.setDisplaySize(size, size);
        } else {
            projectile = scene.physics.add.circle(
                x,
                y,
                size / 2,
                0xff8a4c,
                1
            );

            projectile.setDepth(24);
        }

        projectile.damage = damage;
        projectile.owner = owner;

        projectile.direction = direction || 1;
        projectile.projectileSpeed = speed;
        projectile.projectileLifetime = lifetime;

        projectile.homing = homing;
        projectile.homingStrength = homingStrength;

        projectile.body.setAllowGravity(gravity > 0);
        projectile.body.setGravityY(gravity);

        projectile.body.setVelocity(
            projectile.direction * speed,
            0
        );

        if (tint !== null && projectile.setTint) {
            projectile.setTint(tint);
        }

        projectile.setDataEnabled();

        projectile.setData('enemyProjectile', true);
        projectile.setData('owner', owner);
        projectile.setData('damage', damage);

        this.projectiles.add(projectile);

        // Повторно фиксируем скорость ПОСЛЕ добавления в группу.
        // Это исключает редкий случай, когда физическое тело
        // создаётся с нулевой скоростью и визуально "зависает".
        projectile.body.setVelocity(
            projectile.direction * speed,
            projectile.body.velocity.y ?? 0
        );

        const timer = scene.time.delayedCall(
            lifetime,
            () => {
                this.projectileLifetimeTimers.delete(timer);

                if (projectile?.active) {
                    projectile.destroy();
                }
            }
        );

        this.projectileLifetimeTimers.add(timer);

        return projectile;
    }

    update() {
        const scene = this.scene;
        const player = scene.playerBody;

        if (!player?.active) {
            return;
        }

        for (const projectile of this.projectiles.getChildren()) {
            if (!projectile?.active || !projectile.body) {
                continue;
            }

            if (
                projectile.homing &&
                projectile.homingStrength > 0
            ) {
                const dx = player.x - projectile.x;
                const dy =
                    player.body.center.y -
                    projectile.y;

                const distance =
                    Math.max(1, Math.hypot(dx, dy));

                const targetVX =
                    (dx / distance) *
                    projectile.projectileSpeed;

                const targetVY =
                    (dy / distance) *
                    projectile.projectileSpeed;

                projectile.body.velocity.x = Phaser.Math.Linear(
                    projectile.body.velocity.x,
                    targetVX,
                    projectile.homingStrength
                );

                projectile.body.velocity.y = Phaser.Math.Linear(
                    projectile.body.velocity.y,
                    targetVY,
                    projectile.homingStrength
                );
            }

            if (
                Phaser.Geom.Intersects.RectangleToRectangle(
                    projectile.getBounds(),
                    player.getBounds()
                )
            ) {
                const damage =
                    projectile.damage ?? 1;

                if (
                    typeof scene.damagePlayer ===
                    'function'
                ) {
                    scene.damagePlayer(damage);
                }

                projectile.destroy();
                continue;
            }

            // Уничтожаем снаряд за пределами мира.
            if (
                projectile.x < -200 ||
                projectile.x > scene.worldWidth + 200 ||
                projectile.y < -300 ||
                projectile.y > scene.worldHeight + 300
            ) {
                projectile.destroy();
            }
        }
    }

    clear() {
        for (const timer of this.projectileLifetimeTimers) {
            timer?.remove?.(false);
        }

        this.projectileLifetimeTimers.clear();

        this.projectiles.clear(true, true);
    }

    destroy() {
        this.clear();
    }
}