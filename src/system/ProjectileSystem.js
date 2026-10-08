export class ProjectileSystem {
    static update(scene, delta = 16.666) {
        const projectiles = scene?.projectiles?.getChildren?.() ?? [];
        const dt = Math.min(50, Math.max(0, delta)) / 1000;

        for (const projectile of projectiles) {
            if (!projectile?.active || !projectile.body) continue;

            projectile.x += (projectile.projectileVelocityX ?? 0) * dt;
            projectile.y += (projectile.projectileVelocityY ?? 0) * dt;
            projectile.body.updateFromGameObject();

            const enemies = scene.enemies?.getChildren?.() ?? [];
            for (const enemy of enemies) {
                if (!enemy?.active || enemy.isDying) continue;
                if (
                    scene.currentStageIndex !== undefined &&
                    enemy.stageIndex !== undefined &&
                    enemy.stageIndex !== scene.currentStageIndex
                ) continue;

                if (!Phaser.Geom.Intersects.RectangleToRectangle(
                    projectile.getBounds(),
                    enemy.getBounds()
                )) continue;

                const damage = projectile.damage ?? 1;
                const vx = projectile.projectileVelocityX ?? 0;
                projectile.destroy();

                if (typeof scene.hitEnemy === 'function') {
                    scene.hitEnemy(enemy, {
                        damage,
                        knockbackX: Phaser.Math.Clamp(vx * 0.25, -260, 260),
                        knockbackY: -40,
                        hitStun: scene.CONFIG?.ATTACK?.hitStun ?? 180,
                        hitstop: 24,
                        shake: 1
                    });
                }
                break;
            }
        }
    }
}

export default ProjectileSystem;
