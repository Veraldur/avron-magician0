import {
    getEnemyData
} from '../data/enemies/enemies.js';

import {
    EnemyProjectileSystem
} from './EnemyProjectileSystem.js';

import {
    EnemyAbilitySystem
} from './EnemyAbilitySystem.js';

export class EnemySystem {

    constructor(scene, worldSystem = null) {
        this.scene = scene;
        this.world = worldSystem ?? scene.worldSystem;

        this.config = scene.CONFIG;

        this.enemies =
            scene.physics.add.group();

        // Совместимость с текущими abilities.js,
        // которые ищут scene.enemies.
        scene.enemies = this.enemies;

        this.projectiles =
            new EnemyProjectileSystem(
                scene,
                this
            );

        this.abilities =
            new EnemyAbilitySystem(
                scene,
                this
            );

        this.stageStates = [];

        this.currentStageIndex = 0;

        this.enemyIdCounter = 0;

        // Отдельная валюта. Не смешиваем её
        // с remnants / ability pickups.
        scene.gems ??= 0;

        scene.enemySystem = this;
    }

    // ------------------------------------------------------------
    // STAGE LIFECYCLE
    // ------------------------------------------------------------

    create() {
        this.createStageStates();

        this.currentStageIndex =
            this.scene.currentStageIndex ?? 0;

        this.startStage(
            this.currentStageIndex
        );

        return this;
    }

    createStageStates() {
        const count =
            this.world?.stageCount ??
            this.scene.stageStates?.length ??
            1;

        this.stageStates = [];

        for (let i = 0; i < count; i++) {
            this.stageStates.push({
                index: i,

                start:
                    this.world.stageStart(i),

                end:
                    this.world.stageEnd(i),

                started: false,
                cleared: false,

                enemiesTotal: 0,
                enemiesRemaining: 0
            });
        }

        // MainScene / UI пока ещё могут читать это поле.
        this.scene.stageStates =
            this.stageStates;
    }

    startStage(index) {
        const stage =
            this.stageStates[index];

        if (!stage || stage.started) {
            return;
        }

        stage.started = true;

        const points =
            this.scene.stageSpawnPoints?.[index] ??
            [];

        const limit =
            this.config.STAGE?.enemiesPerStage ??
            points.length;

        const chosen =
            points.slice(0, limit);

        stage.enemiesTotal =
            chosen.length;

        stage.enemiesRemaining =
            chosen.length;

        for (let i = 0; i < chosen.length; i++) {
            const point = chosen[i];

            const enemyType =
                point.enemy ??
                point.type ??
                'grunt';

            const surface =
                this.world.getSpawnSurface(
                    point.x,
                    point.row,
                    index
                );

            this.spawn(
                point.x,
                surface,
                index,
                i,
                enemyType,
                point
            );
        }

        this.currentStageIndex =
            index;

        this.scene.currentStageIndex =
            index;

        this.scene.stageLocked = false;

        this.scene.applyStageCameraBounds?.();

        this.updateStageUI();
    }

    transitionToStage(index) {
        const stage =
            this.stageStates[index];

        if (!stage) return;

        this.currentStageIndex =
            index;

        this.scene.currentStageIndex =
            index;

        this.startStage(index);

        this.scene.stageLocked = false;

        this.scene.applyStageCameraBounds?.();

        this.updateStageUI();
    }

    updateStageUI() {
        this.scene.updateStageUI?.();
    }

    completeStage(index) {
        const stage =
            this.stageStates[index];

        if (
            !stage ||
            stage.cleared ||
            stage.enemiesRemaining > 0
        ) {
            return;
        }

        stage.cleared = true;

        stage.enemiesRemaining = 0;

        this.scene.stageLocked = false;

        this.updateStageUI();

        this.scene.showArenaMessage?.(
            'АРЕНА ЗАЧИЩЕНА'
        );
    }

    // ------------------------------------------------------------
    // SPAWN
    // ------------------------------------------------------------

    spawn(
        x,
        surfaceY,
        stageIndex,
        spawnIndex = 0,
        typeId = 'grunt',
        spawnData = {}
    ) {
        const data =
            getEnemyData(typeId);

        const physics =
            data.physics ?? {
                gravity:
                    this.config.PLAYER.gravity,
                allowGravity: true,
                immovable: false
            };

        const bodyConfig =
            data.body ?? {
                width: 30,
                height: 58
            };

        const visualConfig =
            data.visual ?? {
                width: 52,
                height: 68,
                originY: 1,
                depth: 20
            };

        const body =
            this.scene.add.rectangle(
                x,
                surfaceY -
                bodyConfig.height / 2,
                bodyConfig.width,
                bodyConfig.height,
                0xffffff,
                0
            );

        this.scene.physics.add.existing(
            body
        );

        body.body.setCollideWorldBounds(false);

        body.body.setAllowGravity(
            physics.allowGravity !== false
        );

        body.body.setGravityY(
            physics.gravity ??
            this.config.PLAYER.gravity
        );

        body.body.setImmovable(
            physics.immovable === true
        );

        body.body.setSize(
            bodyConfig.width,
            bodyConfig.height
        );

        const texture =
            data.texture ?? 'enemy';

        let visual;

        if (
            this.scene.textures.exists(texture)
        ) {
            visual =
                this.scene.add.image(
                    x,
                    surfaceY,
                    texture
                )
                .setDisplaySize(
                    visualConfig.width,
                    visualConfig.height
                )
                .setOrigin(
                    0.5,
                    visualConfig.originY ?? 1
                )
                .setDepth(
                    visualConfig.depth ?? 20
                );
        } else {
            visual =
                this.scene.add.rectangle(
                    x,
                    surfaceY -
                    bodyConfig.height / 2,
                    visualConfig.width,
                    visualConfig.height,
                    0x9a9ab5,
                    1
                )
                .setOrigin(0.5, 1)
                .setDepth(
                    visualConfig.depth ?? 20
                );
        }

        body.visual = visual;

        // --------------------------------------------------------
        // RUNTIME STATE
        // --------------------------------------------------------

        body.enemyId =
            `${typeId}_${this.enemyIdCounter++}`;

        body.enemyType =
            typeId;

        body.enemyData =
            data;

        body.hp =
            data.stats?.hp ??
            this.config.ENEMY.hp;

        body.maxHP =
            body.hp;

        body.stageIndex =
            stageIndex;

        body.spawnIndex =
            spawnIndex;

        body.spawnData =
            spawnData;

        body.facing =
            spawnData.facing ??
            -1;

        body.lastDamageTime = 0;

        body.hitStunUntil = 0;

        body.isDying = false;

        body.isLifted = false;

        body.normalGravityY =
            physics.gravity ??
            this.config.PLAYER.gravity;

        body.enemyAbilityCooldowns =
            Object.create(null);

        body.lastAbilityAt = 0;

        body.lastAbilityId = null;

        body.attackCooldownUntil = 0;

        body.aiState = 'patrol';

        body.aiStateUntil = 0;

        body.hpBar =
            this.createHealthBar(
                body
            );

        body.patrolPlatform = null;

        body.patrolLeft = null;

        body.patrolRight = null;

        body.currentSurfaceY =
            surfaceY;

        body.currentPlatformId = null;

        body.isBoss =
            data.boss === true;

        // Boss может иметь свою state.
        body.bossPhase = 0;

        body.gemsMin =
            data.loot?.gems?.min ??
            0;

        body.gemsMax =
            data.loot?.gems?.max ??
            body.gemsMin;

        body.remnantsDrop =
            data.loot?.remnants ??
            0;

        this.configurePlatformMovement(
            body,
            surfaceY,
            stageIndex
        );

        this.enemies.add(body);

        // Общая физика с платформами.
        this.world?.attachEnemy(body);

        return body;
    }

    createHealthBar(enemy) {
        return this.scene.add
            .graphics()
            .setDepth(25);
    }

    configurePlatformMovement(
        enemy,
        surfaceY,
        stageIndex
    ) {
        const movement =
            enemy.enemyData?.movement ?? {};

        if (
            movement.mode === 'flying'
        ) {
            return;
        }

        const platforms =
            this.world?.levelPlatforms ??
            this.scene.levelPlatforms ??
            [];

        let platform =
            platforms.find(p =>
                p.stageIndex === stageIndex &&
                Math.abs(
                    p.surfaceY - surfaceY
                ) < 3 &&
                enemy.x >=
                    p.x - p.width / 2 &&
                enemy.x <=
                    p.x + p.width / 2
            );

        // Если не нашли верхнюю платформу,
        // ищем землю.
        if (!platform) {
            platform =
                platforms.find(p =>
                    p.isGround &&
                    p.stageIndex === stageIndex
                ) ?? null;
        }

        enemy.patrolPlatform =
            platform;

        if (platform) {
            enemy.currentPlatformId =
                `${platform.stageIndex}:${platform.rowIndex}`;

            const margin =
                enemy.enemyData?.boss
                    ? 42
                    : 24;

            enemy.patrolLeft =
                platform.x -
                platform.width / 2 +
                margin;

            enemy.patrolRight =
                platform.x +
                platform.width / 2 -
                margin;

            enemy.currentSurfaceY =
                platform.surfaceY;
        } else {
            // Fallback для земли / нестандартного врага.
            const stageStart =
                this.world.stageStart(
                    stageIndex
                );

            const stageEnd =
                this.world.stageEnd(
                    stageIndex
                );

            enemy.patrolLeft =
                stageStart + 30;

            enemy.patrolRight =
                stageEnd - 30;

            enemy.currentSurfaceY =
                surfaceY;
        }

        // Если spawn явно задаёт патрульную зону,
        // она имеет приоритет.
        const spawnData =
            enemy.spawnData ?? null;

        if (spawnData?.patrolLeft != null) {
            enemy.patrolLeft =
                spawnData.patrolLeft;
        }

        if (spawnData?.patrolRight != null) {
            enemy.patrolRight =
                spawnData.patrolRight;
        }
    }

    // ------------------------------------------------------------
    // UPDATE
    // ------------------------------------------------------------

    update(time, delta) {
        if (!this.scene.playerBody) {
            return;
        }

        this.updateEnemies(
            time,
            delta
        );

        this.projectiles.update();
    }

    updateEnemies(time, delta) {
        const player =
            this.scene.playerBody;

        for (
            const enemy of
            this.enemies.getChildren()
        ) {
            if (
                !enemy?.active ||
                enemy.isDying
            ) {
                continue;
            }

            if (
                enemy.stageIndex !==
                this.currentStageIndex
            ) {
                enemy.body.setVelocityX(0);

                this.syncVisual(enemy);

                continue;
            }

            this.updateBossPhase(
                enemy
            );

            if (
                this.updateLiftedState(
                    enemy,
                    time
                )
            ) {
                continue;
            }

            if (
                enemy.isBoss === false &&
                player.isInvisible
            ) {
                enemy.body.setVelocityX(0);

                this.syncVisual(enemy);

                this.updateHealthBar(
                    enemy
                );

                continue;
            }

            if (
                time <
                (enemy.hitStunUntil ?? 0)
            ) {
                enemy.body.setVelocity(0, 0);

                this.syncVisual(enemy);

                this.updateHealthBar(
                    enemy
                );

                continue;
            }

            const movement =
                enemy.enemyData?.movement ??
                {};

            if (
                movement.mode === 'flying'
            ) {
                this.updateFlying(
                    enemy,
                    time
                );
            } else {
                this.updateGroundEnemy(
                    enemy,
                    time
                );
            }

            this.clampEnemyVelocity(
                enemy
            );

            this.syncVisual(enemy);

            this.updateHealthBar(
                enemy
            );
        }
    }

    updateGroundEnemy(enemy, time) {
        const player =
            this.scene.playerBody;

        const stats =
            enemy.enemyData?.stats ??
            {};

        const movement =
            enemy.enemyData?.movement ??
            {};

        const dx =
            player.x -
            enemy.x;

        const dy =
            player.body.center.y -
            enemy.body.center.y;

        const distance =
            Math.hypot(dx, dy);

        const sameLevel =
            Math.abs(
                dy
            ) < 90;

        const inAggro =
            distance <=
            (
                stats.aggroDistance ??
                this.config.ENEMY.aggroDistance
            );

        // Враг сначала пытается использовать способность.
        // Это работает и для обычных, и для boss врагов.
        if (
            sameLevel ||
            enemy.isBoss
        ) {
            this.abilities.update(
                enemy,
                enemy.enemyData?.attacks?.abilities
            );
        }

        // Контактный бой.
        if (
            enemy.enemyData?.attacks?.contact &&
            Phaser.Geom.Intersects.RectangleToRectangle(
                player.getBounds(),
                enemy.getBounds()
            )
        ) {
            this.tryContactDamage(
                enemy,
                time
            );
        }

        // --------------------------------------------------------
        // НАЗЕМНЫЙ ВРАГ НЕ ПРЫГАЕТ.
        //
        // Но он МОЖЕТ сойти с края платформы.
        // После схода физика сама отправляет его вниз,
        // а после приземления мы привязываем его к новой
        // поверхности. Так враг реально может спуститься
        // с верхнего яруса на дорогу.
        // --------------------------------------------------------
        this.refreshGroundSurface(enemy);

        if (
            inAggro &&
            sameLevel
        ) {
            let direction =
                Math.sign(dx);

            if (!direction) {
                direction =
                    enemy.facing ||
                    1;
            }

            if (
                this.canMoveOnSurface(
                    enemy,
                    direction
                )
            ) {
                enemy.body.setVelocityX(
                    direction *
                    (
                        stats.speed ??
                        this.config.ENEMY.speed
                    )
                );

                enemy.facing =
                    direction;

                enemy.aiState =
                    'chase';
            } else {
                this.reverseEnemy(
                    enemy
                );
            }

            return;
        }

        // Босс roaming:
        // пока не умеет менять вертикальный ярус,
        // зато может бегать по большой зоне.
        if (
            enemy.isBoss &&
            movement.mode ===
                'boss_roaming'
        ) {
            this.updateBossRoaming(
                enemy,
                time
            );

            return;
        }

        // Обычный патруль.
        this.updatePatrol(
            enemy
        );
    }

    updatePatrol(enemy) {
        const movement =
            enemy.enemyData?.movement ??
            {};

        const speed =
            enemy.enemyData?.stats?.speed ??
            this.config.ENEMY.speed;

        const multiplier =
            movement.patrolSpeedMultiplier ??
            0.42;

        if (
            enemy.patrolLeft == null ||
            enemy.patrolRight == null
        ) {
            enemy.patrolLeft =
                enemy.x - 180;

            enemy.patrolRight =
                enemy.x + 180;
        }

        if (
            enemy.x <=
            enemy.patrolLeft
        ) {
            enemy.facing = 1;
        }

        if (
            enemy.x >=
            enemy.patrolRight
        ) {
            enemy.facing = -1;
        }

        const direction =
            enemy.facing || 1;

        if (
            !this.canMoveOnSurface(
                enemy,
                direction
            )
        ) {
            this.reverseEnemy(
                enemy
            );

            return;
        }

        enemy.body.setVelocityX(
            direction *
            speed *
            multiplier
        );

        enemy.aiState =
            'patrol';
    }

    updateBossRoaming(enemy, time) {
        const movement =
            enemy.enemyData?.movement ??
            {};

        const stats =
            enemy.enemyData?.stats ??
            {};

        const player =
            this.scene.playerBody;

        const dx =
            player.x -
            enemy.x;

        const dy =
            player.body.center.y -
            enemy.body.center.y;

        const sameLevel =
            Math.abs(dy) < 120;

        if (
            sameLevel &&
            Math.abs(dx) <
                (
                    stats.aggroDistance ??
                    2200
                )
        ) {
            const direction =
                Math.sign(dx) ||
                enemy.facing ||
                1;

            if (
                this.canMoveOnSurface(
                    enemy,
                    direction
                )
            ) {
                enemy.facing =
                    direction;

                enemy.body.setVelocityX(
                    direction *
                    (
                        stats.speed ??
                        82
                    ) *
                    (enemy.bossSpeedMultiplier ?? 1)
                );

                enemy.aiState =
                    'boss_chase';

                return;
            }
        }

        this.updatePatrol(
            enemy
        );
    }

    updateFlying(enemy, time) {
        const scene =
            this.scene;

        const player =
            scene.playerBody;

        const stats =
            enemy.enemyData?.stats ??
            {};

        const dx =
            player.x -
            enemy.x;

        const dy =
            player.body.center.y -
            enemy.body.center.y;

        const distance =
            Math.hypot(dx, dy);

        if (
            distance <=
            (
                stats.aggroDistance ??
                900
            )
        ) {
            const len =
                Math.max(
                    1,
                    distance
                );

            const speed =
                stats.speed ??
                120;

            enemy.body.setVelocity(
                (dx / len) * speed,
                (dy / len) * speed
            );

            enemy.facing =
                Math.sign(dx) ||
                enemy.facing ||
                1;

            enemy.aiState =
                'chase';
        } else {
            enemy.body.setVelocityX(
                (
                    enemy.facing ||
                    1
                ) *
                (
                    stats.speed ??
                    120
                ) *
                0.45
            );

            enemy.body.setVelocityY(
                Math.sin(
                    time / 500 +
                    enemy.spawnIndex
                ) * 35
            );

            enemy.aiState =
                'patrol';
        }

        this.abilities.update(
            enemy,
            enemy.enemyData?.attacks?.abilities
        );

        if (
            enemy.enemyData?.attacks?.contact &&
            Phaser.Geom.Intersects.RectangleToRectangle(
                player.getBounds(),
                enemy.getBounds()
            )
        ) {
            this.tryContactDamage(
                enemy,
                time
            );
        }
    }

    // ------------------------------------------------------------
    // PLATFORM INTELLIGENCE
    // ------------------------------------------------------------

    refreshGroundSurface(enemy) {
        if (
            !enemy?.active ||
            enemy.enemyData?.movement?.mode === 'flying' ||
            !enemy.body?.blocked?.down
        ) {
            return;
        }

        const platforms =
            this.world?.levelPlatforms ??
            this.scene.levelPlatforms ??
            [];

        const bottom =
            enemy.body.bottom;

        const x =
            enemy.x;

        let best = null;

        for (const platform of platforms) {
            if (!platform || platform.stageIndex !== enemy.stageIndex) {
                continue;
            }

            const left =
                platform.x - platform.width / 2 + 6;

            const right =
                platform.x + platform.width / 2 - 6;

            if (x < left || x > right) {
                continue;
            }

            if (
                Math.abs(platform.surfaceY - bottom) > 14
            ) {
                continue;
            }

            if (
                !best ||
                platform.surfaceY < best.surfaceY
            ) {
                best = platform;
            }
        }

        if (!best) {
            return;
        }

        if (
            enemy.patrolPlatform !== best ||
            enemy.currentSurfaceY !== best.surfaceY
        ) {
            enemy.patrolPlatform = best;
            enemy.currentSurfaceY = best.surfaceY;
            enemy.currentPlatformId =
                `${best.stageIndex}:${best.rowIndex}`;

            const margin =
                enemy.enemyData?.boss
                    ? 42
                    : 24;

            enemy.patrolLeft =
                best.x - best.width / 2 + margin;

            enemy.patrolRight =
                best.x + best.width / 2 - margin;
        }
    }

    canMoveOnSurface(enemy, direction) {
        const movement =
            enemy.enemyData?.movement ??
            {};

        if (
            movement.mode ===
            'flying'
        ) {
            return true;
        }

        if (
            movement.canDrop === true
        ) {
            return true;
        }

        if (
            movement.edgeTurn === false
        ) {
            return true;
        }

        const left =
            enemy.patrolLeft;

        const right =
            enemy.patrolRight;

        if (
            left == null ||
            right == null
        ) {
            return true;
        }

        const margin =
            movement.edgeProbeDistance ??
            18;

        if (
            direction < 0 &&
            enemy.x <= left + margin
        ) {
            return false;
        }

        if (
            direction > 0 &&
            enemy.x >= right - margin
        ) {
            return false;
        }

        // Дополнительная проверка:
        // если прямо перед ногами нет поверхности,
        // не идём в пустоту.
        if (
            enemy.patrolPlatform &&
            !enemy.patrolPlatform.isGround
        ) {
            const probeX =
                enemy.x +
                direction *
                margin;

            const platform =
                enemy.patrolPlatform;

            const inside =
                probeX >=
                    platform.x -
                    platform.width / 2 +
                    8 &&
                probeX <=
                    platform.x +
                    platform.width / 2 -
                    8;

            if (!inside) {
                return false;
            }
        }

        return true;
    }

    reverseEnemy(enemy) {
        enemy.facing =
            -(
                enemy.facing ||
                1
            );

        enemy.body.setVelocityX(
            0
        );
    }

    // ------------------------------------------------------------
    // CONTACT / DAMAGE
    // ------------------------------------------------------------

    tryContactDamage(enemy, time) {
        if (
            time <
            (
                enemy.attackCooldownUntil ??
                0
            )
        ) {
            return;
        }

        const damage =
            enemy.enemyData?.stats
                ?.contactDamage ??
            this.config.ENEMY.contactDamage;

        enemy.attackCooldownUntil =
            time + 650;

        this.scene.damagePlayer?.(
            damage
        );
    }

    hit(enemy, options = {}) {
        if (
            !enemy?.active ||
            enemy.isDying
        ) {
            return false;
        }

        const damage =
            Math.max(
                0,
                options.damage ?? 1
            );

        if (damage <= 0) {
            return false;
        }

        const combat =
            enemy.enemyData?.combat ??
            {};

        enemy.hp -= damage;

        enemy.lastDamageTime =
            this.scene.time.now;

        this.flashEnemy(
            enemy
        );

        if (
            damage >= 2
        ) {
            this.showDamageNumber(
                enemy.x,
                enemy.body?.center.y ??
                enemy.y,
                damage
            );
        }

        // Bosses и специальные враги могут быть immuneToHitStun.
        if (
            enemy.body &&
            combat.immuneToHitStun !== true &&
            enemy.isBoss !== true
        ) {
            enemy.body.setVelocity(
                0,
                0
            );

            enemy.hitStunUntil =
                this.scene.time.now +
                (
                    options.hitStun ??
                    this.config.ATTACK.hitStun
                );
        }

        if (
            options.shake
        ) {
            this.scene.cameras.main.shake(
                90,
                options.shake / 1000
            );
        }

        this.scene.hitstopUntil =
            Math.max(
                this.scene.hitstopUntil ?? 0,
                this.scene.time.now +
                (
                    options.hitstop ??
                    0
                )
            );

        if (
            enemy.hp <= 0
        ) {
            this.kill(
                enemy
            );
        } else {
            this.updateHealthBar(
                enemy
            );
        }

        return true;
    }

    damage(enemy, amount, hitData = {}) {
        return this.hit(
            enemy,
            {
                damage: amount,
                ...hitData
            }
        );
    }

    // ------------------------------------------------------------
    // BOSS
    // ------------------------------------------------------------

    updateBossPhase(enemy) {
        if (
            !enemy.isBoss
        ) {
            return;
        }

        const phases =
            enemy.enemyData
                ?.bossConfig
                ?.phases ??
            [];

        if (
            phases.length === 0
        ) {
            return;
        }

        const ratio =
            enemy.hp /
            Math.max(
                1,
                enemy.maxHP
            );

        let phase = 0;

        for (
            let i = 0;
            i < phases.length;
            i++
        ) {
            if (
                ratio <=
                phases[i].hpPercent
            ) {
                phase =
                    i + 1;
            }
        }

        if (
            phase !==
            enemy.bossPhase
        ) {
            enemy.bossPhase =
                phase;

            const data =
                phases[
                    Math.min(
                        phase - 1,
                        phases.length - 1
                    )
                ];

            if (data?.speedMultiplier) {
                enemy.bossSpeedMultiplier =
                    data.speedMultiplier;
            }

            this.scene.showArenaMessage?.(
                `БОСС: ФАЗА ${phase + 1}`
            );
        }
    }

    // ------------------------------------------------------------
    // DEATH / LOOT
    // ------------------------------------------------------------

    kill(enemy) {
        if (
            !enemy?.active ||
            enemy.isDying
        ) {
            return;
        }

        enemy.isDying =
            true;

        const stageIndex =
            enemy.stageIndex;

        const x =
            enemy.x;

        const y =
            enemy.body?.center.y ??
            enemy.y;

        this.spawnLoot(
            enemy,
            x,
            y,
            stageIndex
        );

        if (
            enemy.hpBar?.active
        ) {
            enemy.hpBar.destroy();
        }

        if (
            enemy.visual?.active
        ) {
            const burst =
                this.scene.add
                    .image(
                        x,
                        y,
                        this.scene.textures.exists(
                            'sigil_shadow'
                        )
                            ? 'sigil_shadow'
                            : 'enemy'
                    )
                    .setDisplaySize(
                        enemy.isBoss
                            ? 110
                            : 54,
                        enemy.isBoss
                            ? 110
                            : 54
                    )
                    .setAlpha(0.8)
                    .setBlendMode(
                        Phaser.BlendModes.ADD
                    );

            this.scene.tweens.add({
                targets: burst,

                scale: enemy.isBoss
                    ? 2.2
                    : 1.8,

                alpha: 0,

                angle: 180,

                duration:
                    enemy.isBoss
                        ? 500
                        : 260,

                onComplete: () =>
                    burst.destroy()
            });

            enemy.visual.destroy();
        }

        enemy.destroy();

        const stage =
            this.stageStates[
                stageIndex
            ];

        if (
            stage &&
            !stage.cleared
        ) {
            stage.enemiesRemaining =
                Math.max(
                    0,
                    stage.enemiesRemaining - 1
                );

            if (
                stage.enemiesRemaining === 0
            ) {
                this.completeStage(
                    stageIndex
                );
            }
        }
    }

    spawnLoot(
        enemy,
        sourceX,
        sourceY,
        stageIndex
    ) {
        const min =
            enemy.gemsMin ?? 0;

        const max =
            Math.max(
                min,
                enemy.gemsMax ?? min
            );

        const gemCount =
            min === max
                ? min
                : Phaser.Math.Between(
                    min,
                    max
                );

        for (
            let i = 0;
            i < gemCount;
            i++
        ) {
            this.spawnGem(
                sourceX,
                sourceY,
                stageIndex,
                enemy
            );
        }

        // Пока сохраняем старую механику remnants.
        const remnants =
            enemy.remnantsDrop ?? 0;

        if (
            remnants > 0 &&
            typeof this.scene.spawnRemnants ===
                'function'
        ) {
            // НЕ вызываем старый spawnRemnants,
            // если MainScene уже передал управление
            // EnemySystem полностью.
            //
            // Здесь только совместимость.
            if (
                !this.scene.enemySystemOwnsRemnants
            ) {
                this.scene.spawnRemnants(
                    sourceX,
                    sourceY,
                    stageIndex
                );
            }
        }
    }

    spawnGem(
        sourceX,
        sourceY,
        stageIndex,
        enemy
    ) {
        const distance =
            Phaser.Math.Between(
                70,
                150
            );

        const angle =
            Phaser.Math.FloatBetween(
                0,
                Math.PI * 2
            );

        const left =
            this.world.stageStart(
                stageIndex
            ) + 30;

        const right =
            this.world.stageEnd(
                stageIndex
            ) - 30;

        const x =
            Phaser.Math.Clamp(
                sourceX +
                    Math.cos(angle) *
                    distance,
                left,
                right
            );

        const y =
            Phaser.Math.Clamp(
                sourceY +
                    Math.sin(angle) *
                    distance *
                    0.35,
                40,
                this.scene.worldHeight - 60
            );

        const gem =
            this.scene.add
                .circle(
                    x,
                    y,
                    enemy.isBoss ? 10 : 7,
                    enemy.isBoss
                        ? 0xffd65a
                        : 0x66ccff,
                    0.95
                )
                .setStrokeStyle(
                    2,
                    enemy.isBoss
                        ? 0xffffff
                        : 0xbbeeff
                )
                .setDepth(22);

        gem.stageIndex =
            stageIndex;

        gem.value = 1;

        gem.velocityY =
            -Phaser.Math.Between(
                180,
                300
            );

        gem.spawnedAt =
            this.scene.time.now;

        gem.sourceEnemyId =
            enemy.enemyId;

        if (!this.scene.enemyGems) {
            this.scene.enemyGems = [];
        }

        this.scene.enemyGems.push(
            gem
        );
    }

    getLootSurfaceY(x, y, stageIndex) {
        const platforms =
            this.world?.levelPlatforms ??
            this.scene.levelPlatforms ??
            [];

        let best = null;

        for (const platform of platforms) {
            if (!platform || platform.stageIndex !== stageIndex) {
                continue;
            }

            const left =
                platform.x - platform.width / 2 + 4;

            const right =
                platform.x + platform.width / 2 - 4;

            if (x < left || x > right) {
                continue;
            }

            const surfaceY =
                platform.surfaceY;

            // Берём ближайшую поверхность НАД точкой гема.
            if (surfaceY < y + 8) {
                if (
                    best === null ||
                    surfaceY > best
                ) {
                    best = surfaceY;
                }
            }
        }

        // Если ничего не нашли, используем дно дороги.
        if (best === null) {
            const ground =
                platforms.find(
                    p =>
                        p?.stageIndex === stageIndex &&
                        p?.isGround
                );

            if (ground) {
                best = ground.surfaceY;
            }
        }

        return best;
    }

    updateLoot() {
        const player =
            this.scene.playerBody;

        if (!player?.active) {
            return;
        }

        const gems =
            this.scene.enemyGems ??
            [];

        for (
            let i = gems.length - 1;
            i >= 0;
            i--
        ) {
            const gem =
                gems[i];

            if (
                !gem?.active
            ) {
                gems.splice(i, 1);
                continue;
            }

            // Простая физика падения.
            gem.velocityY =
                Math.min(
                    gem.velocityY + 900 / 60,
                    520
                );

            gem.y +=
                gem.velocityY /
                60;

            // Гемы должны лежать НА поверхности,
            // а не просто упираться в worldHeight.
            const surface =
                this.getLootSurfaceY(
                    gem.x,
                    gem.y,
                    gem.stageIndex
                );

            if (
                surface !== null &&
                gem.y >= surface - 4 &&
                gem.velocityY > 0
            ) {
                gem.y = surface - 4;
                gem.velocityY =
                    -Math.max(
                        28,
                        Math.abs(gem.velocityY) * 0.22
                    );
            }

            gem.setScale(
                1 +
                Math.sin(
                    this.scene.time.now /
                    180
                ) * 0.08
            );

            if (
                gem.stageIndex ===
                    this.currentStageIndex &&
                Phaser.Math.Distance.Between(
                    player.x,
                    player.body.center.y,
                    gem.x,
                    gem.y
                ) <=
                    (
                        this.config.PICKUP
                            ?.autoCollectRadius ??
                        75
                    )
            ) {
                this.scene.gems +=
                    gem.value ?? 1;

                gem.destroy();

                gems.splice(i, 1);

                this.scene.updateUI?.();
            }
        }
    }

    // ------------------------------------------------------------
    // VISUALS
    // ------------------------------------------------------------

    syncVisual(enemy) {
        if (
            !enemy?.active ||
            !enemy.visual ||
            !enemy.body
        ) {
            return;
        }

        const mode =
            enemy.enemyData
                ?.movement
                ?.mode;

        enemy.visual.x =
            enemy.x;

        if (
            mode === 'flying'
        ) {
            enemy.visual.y =
                enemy.body.center.y;
        } else {
            enemy.visual.y =
                enemy.body.bottom;
        }

        if (
            enemy.visual.setFlipX
        ) {
            enemy.visual.setFlipX(
                enemy.facing < 0
            );
        }
    }

    updateHealthBar(enemy) {
        if (
            !enemy?.hpBar?.active ||
            !enemy.body
        ) {
            return;
        }

        const ratio =
            Phaser.Math.Clamp(
                enemy.hp /
                Math.max(
                    1,
                    enemy.maxHP
                ),
                0,
                1
            );

        const g =
            enemy.hpBar;

        const width =
            enemy.isBoss
                ? 100
                : 48;

        const height =
            enemy.isBoss
                ? 7
                : 5;

        const x =
            enemy.x -
            width / 2;

        const y =
            enemy.body.top -
            (
                enemy.isBoss
                    ? 18
                    : 13
            );

        g.clear();

        g.fillStyle(
            0x080812,
            0.85
        );

        g.fillRect(
            x,
            y,
            width,
            height
        );

        g.fillStyle(
            ratio > 0.45
                ? 0x8dff9f
                : 0xff7b7b,
            1
        );

        g.fillRect(
            x + 1,
            y + 1,
            (
                width - 2
            ) * ratio,
            height - 2
        );
    }

    flashEnemy(enemy) {
        if (
            !enemy?.visual?.active
        ) {
            return;
        }

        if (
            enemy.visual.setTintFill
        ) {
            enemy.visual.setTintFill(
                0xffffff
            );
        }

        enemy.visual.setAlpha(1);

        this.scene.time.delayedCall(
            65,
            () => {
                if (
                    enemy.visual?.active &&
                    enemy.visual.clearTint
                ) {
                    enemy.visual.clearTint();
                }
            }
        );
    }

    showDamageNumber(
        x,
        y,
        damage
    ) {
        const text =
            this.scene.add.text(
                x,
                y - 36,
                String(damage),
                {
                    fontFamily: 'Arial',
                    fontSize: '18px',
                    color: '#ffffff',
                    fontStyle: 'bold',
                    stroke: '#11111c',
                    strokeThickness: 4
                }
            )
            .setOrigin(0.5)
            .setDepth(30);

        this.scene.tweens.add({
            targets: text,

            y: y - 72,

            alpha: 0,

            duration: 420,

            ease: 'Cubic.Out',

            onComplete: () =>
                text.destroy()
        });
    }

    // ------------------------------------------------------------
    // SAFETY
    // ------------------------------------------------------------

    clampEnemyVelocity(enemy) {
        if (
            !enemy?.body
        ) {
            return;
        }

        enemy.body.setVelocityY(
            Phaser.Math.Clamp(
                enemy.body.velocity.y,
                -900,
                900
            )
        );

        if (
            enemy.body.bottom >
            this.scene.worldHeight + 100
        ) {
            // Если наземный враг каким-то образом упал,
            // возвращаем его на его исходную поверхность.
            const y =
                enemy.currentSurfaceY ??
                this.world.getGroundY();

            enemy.body.reset(
                enemy.x,
                y -
                enemy.body.height / 2 -
                2
            );

            enemy.body.setVelocity(
                0,
                0
            );
        }
    }

    updateLiftedState(enemy, time) {
        if (!enemy.isLifted) {
            return false;
        }

        enemy.body.setGravityY(0);

        enemy.body.setVelocityX(0);

        if (
            time <
            (enemy.liftArriveAt ?? 0)
        ) {
            const duration =
                Math.max(
                    1,
                    (
                        enemy.liftArriveAt ??
                        time
                    ) -
                    (
                        enemy.liftStartedAt ??
                        time
                    )
                );

            const t =
                Phaser.Math.Clamp(
                    (
                        time -
                        (
                            enemy.liftStartedAt ??
                            time
                        )
                    ) /
                    duration,
                    0,
                    1
                );

            const y =
                Phaser.Math.Linear(
                    enemy.liftStartY ??
                        enemy.body.center.y,
                    enemy.liftTargetY ??
                        enemy.body.center.y,
                    t
                );

            enemy.body.reset(
                enemy.body.center.x,
                y
            );
        } else if (
            time <
            (enemy.liftUntil ?? 0)
        ) {
            enemy.body.setVelocityY(0);
        } else {
            enemy.isLifted = false;

            enemy.liftUntil = 0;
            enemy.liftStartedAt = 0;
            enemy.liftArriveAt = 0;

            enemy.body.setGravityY(
                enemy.normalGravityY ??
                this.config.PLAYER.gravity
            );

            enemy.body.setVelocityY(0);
        }

        this.syncVisual(enemy);
        this.updateHealthBar(enemy);

        return enemy.isLifted;
    }

    // ------------------------------------------------------------
    // COMPATIBILITY
    // ------------------------------------------------------------

    getChildren() {
        return this.enemies.getChildren();
    }

    damagePlayer(amount) {
        this.scene.damagePlayer?.(
            amount
        );
    }

    destroy() {
        this.projectiles.destroy();

        for (
            const enemy of
            this.enemies.getChildren()
        ) {
            if (
                enemy?.hpBar?.active
            ) {
                enemy.hpBar.destroy();
            }

            enemy?.visual?.destroy?.();
        }

        this.enemies.clear(
            true,
            true
        );

        const gems =
            this.scene.enemyGems ??
            [];

        for (
            const gem of gems
        ) {
            gem?.destroy?.();
        }

        this.scene.enemyGems =
            [];

        if (
            this.scene.enemies ===
            this.enemies
        ) {
            this.scene.enemies =
                null;
        }
    }
}