function getEnemies(scene) {
    if (scene.enemies && typeof scene.enemies.getChildren === 'function') {
        return scene.enemies.getChildren();
    }

    if (scene.enemy && scene.enemy.active) {
        return [scene.enemy];
    }

    return [];
}

function getEnemyCenterY(enemy) {
    return enemy?.body?.center?.y ?? enemy?.y ?? 0;
}

function damageEnemy(scene, enemy, amount, hitData = {}) {
    if (!enemy || !enemy.active) return;

    if (typeof scene.hitEnemy === 'function' && scene.enemies) {
        scene.hitEnemy(enemy, {
            damage: amount,
            ...hitData
        });
        return;
    }

    if (typeof scene.damageEnemy === 'function') {
        scene.damageEnemy(amount);
    }
}

function damageEnemiesInRadius(scene, x, y, radius, amount, hitData = {}) {
    for (const enemy of getEnemies(scene)) {
        if (!enemy?.active) continue;

        if (
            scene.currentStageIndex !== undefined &&
            enemy.stageIndex !== undefined &&
            enemy.stageIndex !== scene.currentStageIndex
        ) {
            continue;
        }

        const distance = Phaser.Math.Distance.Between(
            x,
            y,
            enemy.x,
            getEnemyCenterY(enemy)
        );

        if (distance <= radius) {
            damageEnemy(scene, enemy, amount, hitData);
        }
    }
}

function createExplosionEffect(scene, x, y, radius, color = 0xffa13a) {
    const core = scene.add
        .circle(x, y, 24, color, 0.55)
        .setStrokeStyle(4, 0xffffff, 0.85)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(25);

    const ring = scene.add
        .circle(x, y, 38, color, 0)
        .setStrokeStyle(6, color, 0.8)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(24);

    scene.tweens.add({
        targets: [core, ring],
        scaleX: radius / 24,
        scaleY: radius / 24,
        alpha: 0,
        duration: 360,
        ease: 'Cubic.Out',
        onComplete: () => {
            core.destroy();
            ring.destroy();
        }
    });

    if (scene.cameras?.main) {
        scene.cameras.main.shake(100, 0.004);
    }
}

function spawnFireProjectile(scene, playerBody) {
    const direction = playerBody.facing || 1;
    const x = playerBody.x + direction * 42;
    const y = playerBody.body?.center?.y ?? playerBody.y;

    const size = scene.CONFIG?.PROJECTILE?.size ?? 22;
    const damage = scene.CONFIG?.PROJECTILE?.baseDamage ?? 20;
    const speed = scene.CONFIG?.PROJECTILE?.baseSpeed ?? 700;
    const lifetime = scene.CONFIG?.PROJECTILE?.lifetime ?? 1800;

    const projectile = scene.physics.add.image(x, y, 'fireball');

    projectile.setDisplaySize(size, size);
    projectile.damage = damage;
    projectile.projectileVelocityX = direction * speed;
    projectile.projectileVelocityY = 0;
    projectile.body.setAllowGravity(false);
    projectile.body.setDrag(0, 0);
    projectile.body.setVelocity(projectile.projectileVelocityX, 0);

    // MainScene уже имеет общую группу снарядов.
    if (scene.projectiles && typeof scene.projectiles.add === 'function') {
        scene.projectiles.add(projectile);

        scene.time.delayedCall(lifetime, () => {
            if (projectile.active) {
                projectile.destroy();
            }
        });

        return;
    }

    // TutorialScene работает с одним enemy и не использует группу projectiles.
    const collisionTimer = scene.time.addEvent({
        delay: 16,
        loop: true,
        callback: () => {
            if (!projectile.active) {
                collisionTimer.remove(false);
                return;
            }

            const enemy = scene.enemy;

            if (
                enemy?.active &&
                Phaser.Geom.Intersects.RectangleToRectangle(
                    projectile.getBounds(),
                    enemy.getBounds()
                )
            ) {
                damageEnemy(scene, enemy, projectile.damage);
                collisionTimer.remove(false);
                projectile.destroy();
            }
        }
    });

    scene.time.delayedCall(lifetime, () => {
        collisionTimer.remove(false);

        if (projectile.active) {
            projectile.destroy();
        }
    });
}

function castFire(scene, playerBody) {
    spawnFireProjectile(scene, playerBody);
}

function castShadowDash(scene, playerBody) {
    const speed = scene.CONFIG?.DASH?.shadowSpeed ?? 1200;
    const duration = scene.CONFIG?.DASH?.shadowDuration ?? 900;

    if (typeof scene.startPlayerDash === 'function') {
        scene.startPlayerDash(speed, duration);
    } else {
        const direction = playerBody.facing || 1;
        playerBody.body.setVelocityX(direction * speed);
    }

    if (typeof scene.showMagicEffect === 'function') {
        scene.showMagicEffect('shadowDash');
    }
}

function castEnergyExplosion(scene, playerBody) {
    const x = playerBody.x;
    const y = playerBody.body?.center?.y ?? playerBody.y;
    const radius = 170;
    const damage = 100;

    damageEnemiesInRadius(scene, x, y, radius, damage, {
        knockbackX: 0,
        knockbackY: 0,
        hitStun: 240,
        hitstop: 55,
        shake: 5
    });

    createExplosionEffect(scene, x, y, radius, 0x78d7ff);
}

function castHighJump(scene, playerBody) {
    playerBody.jumpAnimation = 'ability';

    const jumpVelocity =
        scene.CONFIG?.MAGIC?.jumpVelocity ??
        scene.CONFIG?.PLAYER?.jumpVelocity ??
        -850;

    playerBody.body.setVelocityY(-Math.abs(jumpVelocity));
    playerBody.canDoubleJump = true;
}

function castFireDash(scene, playerBody) {
    const direction = playerBody.facing || 1;
    const speed = scene.CONFIG?.DASH?.fireSpeed ?? 1300;
    const duration = scene.CONFIG?.DASH?.fireDuration ?? 900;

    if (typeof scene.startPlayerDash === 'function') {
        scene.startPlayerDash(speed, duration);
    } else {
        playerBody.body.setVelocityX(direction * speed);
    }

    const x = playerBody.x;
    const y = playerBody.body?.center?.y ?? playerBody.y;

    damageEnemiesInRadius(scene, x + direction * 55, y, 90, 1, {
        knockbackX: direction * 300,
        knockbackY: -100,
        hitStun: 180
    });

    createExplosionEffect(scene, x, y, 90, 0xff8a2b);
}

function castFireExplosion(scene, playerBody) {
    const x = playerBody.x;
    const y = playerBody.body?.center?.y ?? playerBody.y;

    if (typeof scene.createExplosion === 'function') {
        scene.createExplosion(x, y, 170, 1, 'sigil_flame');
    } else {
        damageEnemiesInRadius(scene, x, y, 170, 1, {
            knockbackX: 0,
            knockbackY: 0,
            hitStun: 180
        });

        createExplosionEffect(scene, x, y, 170, 0xffa13a);
    }
}

function castFireJump(scene, playerBody) {
    playerBody.jumpAnimation = 'ability';

    const jumpVelocity =
        scene.CONFIG?.MAGIC?.jumpVelocity ??
        scene.CONFIG?.PLAYER?.jumpVelocity ??
        -850;

    playerBody.body.setVelocityY(-Math.abs(jumpVelocity));
    playerBody.canDoubleJump = true;

    const x = playerBody.x;
    const y = playerBody.body?.center?.y ?? playerBody.y;

    if (typeof scene.createExplosion === 'function') {
        scene.createExplosion(x, y, 90, 1, 'sigil_flame');
    } else {
        damageEnemiesInRadius(scene, x, y, 90, 1, {
            knockbackX: 0,
            knockbackY: 0,
            hitStun: 180
        });

        createExplosionEffect(scene, x, y, 90, 0xffa13a);
    }
}

function castInvisibility(scene, playerBody) {
    playerBody.isInvisible = true;

    if (scene.playerSprite) {
        scene.playerSprite.setAlpha(0.18);
    }

    if (scene._invisibilityTimer) {
        scene._invisibilityTimer.remove(false);
    }

    const duration = 1800;

    scene._invisibilityTimer = scene.time.delayedCall(duration, () => {
        if (!playerBody?.active) return;

        playerBody.isInvisible = false;

        if (scene.playerSprite) {
            scene.playerSprite.setAlpha(1);
        }

        scene._invisibilityTimer = null;
    });
}

function castTeleportUp(scene, playerBody) {
    const body = playerBody.body;

    if (!body) return;

    // MainScene: настоящий телепорт вверх.
    if (typeof body.reset === 'function' && scene.worldHeight) {
        const newY = Phaser.Math.Clamp(
            body.y - 280,
            body.height / 2,
            scene.worldHeight - body.height / 2
        );

        body.reset(body.x, newY);
        body.setVelocity(0, 0);
        return;
    }

    // TutorialScene: запасной вариант.
    body.setVelocityY(-900);
}

function castFireAura(scene, playerBody) {
    const duration = 1800;
    const tick = 300;
    const radius = 125;

    const aura = scene.add
        .circle(
            playerBody.x,
            playerBody.body?.center?.y ?? playerBody.y,
            34,
            0xffa13a,
            0.18
        )
        .setStrokeStyle(3, 0xffd27a, 0.8)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(20);

    const timer = scene.time.addEvent({
        delay: tick,
        repeat: Math.floor(duration / tick) - 1,
        callback: () => {
            if (!playerBody?.active) return;

            aura.x = playerBody.x;
            aura.y = playerBody.body?.center?.y ?? playerBody.y;

            damageEnemiesInRadius(scene, aura.x, aura.y, radius, 1, {
                knockbackX: 0,
                knockbackY: 0,
                hitStun: 180,
                shake: 1
            });
        }
    });

    scene.time.delayedCall(duration, () => {
        timer.remove(false);

        if (aura.active) {
            aura.destroy();
        }
    });
}

function castLiftEnemies(scene, playerBody) {
    if (typeof scene.performLiftEnemies === 'function') {
        return scene.performLiftEnemies();
    }

    const liftVelocity = -Math.abs(scene.CONFIG?.MAGIC?.liftHeight ?? 180) * 2.2;
    let lifted = false;
    for (const enemy of getEnemies(scene)) {
        if (!enemy?.active || !enemy.body) continue;
        enemy.body.setVelocityY(liftVelocity);
        enemy.hitStunUntil = (scene.time?.now ?? 0) + 360;
        lifted = true;
    }
    return lifted;
}

function spawnSigilProjectile(scene, playerBody, texture, damage = 12, speed = 760, lifetime = 1500, radius = 18) {
    if (!scene?.physics?.add || !playerBody?.body || !scene.projectiles) return false;
    const direction = playerBody.facing || 1;
    const projectile = scene.physics.add.image(
        playerBody.x + direction * 46,
        playerBody.body.center.y,
        texture
    );
    projectile.setDisplaySize(radius * 2, radius * 2);
    projectile.projectileVelocityX = direction * speed;
    projectile.damage = damage;
    projectile.body.setAllowGravity(false);
    projectile.body.setImmovable(true);
    projectile.body.setVelocity(projectile.projectileVelocityX, 0);
    scene.projectiles.add(projectile);
    scene.time.delayedCall(lifetime, () => { if (projectile.active) projectile.destroy(); });
    return true;
}

function damageRadius(scene, playerBody, radius, damage) {
    const x = playerBody.x;
    const y = playerBody.body?.center?.y ?? playerBody.y;
    damageEnemiesInRadius(scene, x, y, radius, damage, { knockbackX: 0, knockbackY: 0, hitStun: 180, hitstop: 24, shake: 2 });
}

function castWaterProjectile(scene, playerBody) {
    return spawnSigilProjectile(scene, playerBody, 'sigil_water', 18, 820, 1500, 16);
}

function castWaterBurst(scene, playerBody) {
    // Z+Z: два водных снаряда веером. Автокаст должен иметь заметный результат.
    const ok1 = spawnSigilProjectile(scene, playerBody, 'sigil_water', 22, 900, 1600, 18);
    const direction = playerBody.facing || 1;
    if (ok1) {
        const second = scene.physics.add.image(playerBody.x + direction * 46, playerBody.body.center.y - 22, 'sigil_water');
        second.setDisplaySize(30, 30);
        second.projectileVelocityX = direction * 760;
        second.projectileVelocityY = -110;
        second.damage = 16;
        second.body.setAllowGravity(false);
        second.body.setVelocity(second.projectileVelocityX, second.projectileVelocityY);
        scene.projectiles.add(second);
        scene.time.delayedCall(1600, () => { if (second.active) second.destroy(); });
    }
    return ok1;
}

function castLightBurst(scene, playerBody) {
    damageRadius(scene, playerBody, 145, 18);
    createExplosionEffect(scene, playerBody.x, playerBody.body.center.y, 145, 0xfff2a0);
    return true;
}

function castLightDash(scene, playerBody) {
    if (typeof scene.startPlayerDash !== 'function') return false;
    scene.startPlayerDash(scene.CONFIG?.DASH?.lightSpeed ?? 1350, scene.CONFIG?.DASH?.lightDuration ?? 900);
    damageEnemiesInRadius(scene, playerBody.x + (playerBody.facing || 1) * 70, playerBody.body.center.y, 105, 22, { knockbackX: (playerBody.facing || 1) * 420, knockbackY: -80, hitStun: 180 });
    return true;
}

function castWaterLightDash(scene, playerBody) {
    if (typeof scene.startPlayerDash !== 'function') return false;
    scene.startPlayerDash(scene.CONFIG?.DASH?.waterLightSpeed ?? 1450, scene.CONFIG?.DASH?.waterLightDuration ?? 950);
    damageEnemiesInRadius(scene, playerBody.x + (playerBody.facing || 1) * 85, playerBody.body.center.y, 120, 28, { knockbackX: (playerBody.facing || 1) * 520, knockbackY: -120, hitStun: 220 });
    return true;
}

function castTimeStop(scene, playerBody) {
    scene.timeStopUntil = scene.time.now + 1800;
    for (const enemy of getEnemies(scene)) {
        if (!enemy?.active) continue;
        enemy.body?.setVelocity?.(0, 0);
        enemy.hitStunUntil = scene.timeStopUntil;
    }
    return true;
}

function castTimePulse(scene, playerBody) {
    damageRadius(scene, playerBody, 155, 20);
    return true;
}

function castTimeJump(scene, playerBody) {
    playerBody.body.setVelocityY(-Math.abs(scene.CONFIG?.MAGIC?.jumpVelocity ?? 850));
    playerBody.canDoubleJump = true;
    return true;
}

function castTimeWave(scene, playerBody) {
    return spawnSigilProjectile(scene, playerBody, 'sigil_time', 24, 680, 1800, 22);
}

export const ABILITIES = {
    fire: castFire,
    shadowDash: castShadowDash,
    energyExplosion: castEnergyExplosion,
    highJump: castHighJump,
    fireDash: castFireDash,
    fireExplosion: castFireExplosion,
    fireJump: castFireJump,
    invisibility: castInvisibility,
    teleportUp: castTeleportUp,
    fireAura: castFireAura,
    liftEnemies: castLiftEnemies,
    waterProjectile: castWaterProjectile,
    waterBurst: castWaterBurst,
    lightBurst: castLightBurst,
    lightDash: castLightDash,
    waterLightDash: castWaterLightDash,
    timeStop: castTimeStop,
    timePulse: castTimePulse,
    timeJump: castTimeJump,
    timeWave: castTimeWave
};

