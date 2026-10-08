import { StageSystem } from './StageSystem.js';

/**
 * Единственный runtime-владелец физического мира.
 *
 * WorldSystem отвечает за:
 * - размеры мира и камеры;
 * - создание/регистрацию платформ;
 * - общие physics-профили платформ;
 * - привязку игрока/врагов к геометрии;
 * - движущиеся платформы;
 * - фоновые слои.
 *
 * Что НЕ хранится здесь:
 * - конкретный дизайн стадии;
 * - AI врагов;
 * - способности;
 * - персонажи.
 *
 * Дизайн приходит из StageSystem/data/stages.js.
 */
export class WorldSystem {
    constructor(scene) {
        this.scene = scene;
        this.levelPlatforms = [];
        this.stageSpawnPoints = [];
        this.movingPlatforms = [];
        this.stageCount = StageSystem.count();
        this.created = false;
        this.backgroundLayers = [];
    }

    create() {
        if (this.created) return this;

        this.createWorld();
        this.createPlatforms();
        this.createMovingPlatforms();
        this.syncSceneReferences();

        this.created = true;
        return this;
    }

    syncSceneReferences() {
        const scene = this.scene;
        scene.levelPlatforms = this.levelPlatforms;
        scene.stageSpawnPoints = this.stageSpawnPoints;
        scene.movingPlatforms = this.movingPlatforms;
    }

    createWorld() {
        const scene = this.scene;

        scene.physics.world.setBounds(
            0,
            0,
            scene.worldWidth,
            scene.worldHeight
        );

        scene.cameras.main.setBackgroundColor('#080812');

        // НЕЛЬЗЯ создавать TileSprite размером во весь worldWidth.
        // При worldWidth = 28000 Phaser пытается создать canvas/WebGL texture
        // такого размера и получает INVALID_VALUE: texImage2D.
        // Вместо этого фон имеет размер viewport и следует за камерой,
        // а tilePosition даёт параллакс.
        const width = Math.min(
            Math.max(scene.viewportWidth * 2, 1600),
            4096
        );
        const height = Math.min(
            Math.max(scene.viewportHeight * 2, 1200),
            4096
        );

        this.backgroundLayers = [
            this.createBackgroundLayer('terrain_bg_far', width, height, 0.08, 1, -30),
            this.createBackgroundLayer('terrain_bg_mid', width, height, 0.22, 0.92, -20),
            this.createBackgroundLayer('terrain_fog', width, height, 0.34, 0.28, -10)
        ];
    }

    createBackgroundLayer(texture, width, height, parallax, alpha, depth) {
        const scene = this.scene;
        const layer = scene.add
            .tileSprite(
                scene.viewportWidth / 2,
                scene.viewportHeight / 2,
                width,
                height,
                texture
            )
            .setScrollFactor(0)
            .setAlpha(alpha)
            .setDepth(depth);

        layer.parallax = parallax;
        return layer;
    }

    updateBackgrounds() {
        const camera = this.scene.cameras.main;
        const centerX = camera.scrollX + camera.width / 2;
        const centerY = camera.scrollY + camera.height / 2;

        for (const layer of this.backgroundLayers) {
            if (!layer?.active) continue;

            layer.x = centerX;
            layer.y = centerY;
            layer.tilePositionX = camera.scrollX * layer.parallax;
            layer.tilePositionY = camera.scrollY * layer.parallax;
        }
    }

    stageStart(index) {
        return index * this.scene.stageWidth;
    }

    stageEnd(index) {
        return (index + 1) * this.scene.stageWidth;
    }

    stageCenter(index) {
        return this.stageStart(index) + this.scene.stageWidth / 2;
    }

    createPlatforms() {
        this.levelPlatforms.length = 0;
        this.stageSpawnPoints.length = 0;

        StageSystem.build(this);
        this.syncSceneReferences();
    }

    /**
     * Единый physics builder для ВСЕХ статических платформ.
     * Конкретная текстура/размер/позиция приходят из StageSystem/data.
     */
    addStaticPlatform(spec, ...legacyArgs) {
        // Поддерживаем старый positional API, но внутри всё равно
        // нормализуем его в единый descriptor.
        if (typeof spec === 'number') {
            const [y, width, height, stageIndex, rowIndex, isGround = false, visual = null, surfaceInset = 0] = legacyArgs;
            spec = {
                x: spec,
                y,
                width,
                height,
                stageIndex,
                rowIndex,
                isGround,
                texture: null,
                displayWidth: visual?.displayWidth ?? width,
                displayHeight: visual?.displayHeight ?? height,
                displayOrigin: { x: 0.5, y: 0.5 },
                depth: 10,
                oneWay: !isGround,
                surfaceInset
            };
        }

        const {
            x,
            y,
            width,
            height,
            stageIndex,
            rowIndex,
            isGround = false,
            texture = null,
            displayWidth = width,
            displayHeight = height,
            displayOrigin = { x: 0.5, y: 0.5 },
            depth = 10,
            oneWay = !isGround,
            surfaceInset = 0
        } = spec;

        const scene = this.scene;

        let visual = null;
        if (texture && scene.textures.exists(texture)) {
            visual = scene.add
                .image(x, y, texture)
                .setDisplaySize(displayWidth, displayHeight)
                .setOrigin(displayOrigin.x, displayOrigin.y)
                .setDepth(depth);
        } else {
            visual = scene.add
                .rectangle(
                    x,
                    y,
                    displayWidth,
                    displayHeight,
                    isGround ? 0x30334b : 0x3c405d,
                    1
                )
                .setDepth(depth);
        }

        const collider = scene.add.rectangle(
            x,
            y,
            width,
            height,
            0xffffff,
            0
        );

        scene.physics.add.existing(collider, true);
        collider.visible = false;

        if (oneWay) {
            collider.body.checkCollision.down = false;
            collider.body.checkCollision.left = false;
            collider.body.checkCollision.right = false;
        }

        const platform = {
            x,
            y,
            width,
            height,
            isGround,
            surfaceY: y - height / 2,
            surfaceInset,
            stageIndex,
            rowIndex,
            texture,
            visual,
            collider,
            attachedBodies: new Set()
        };

        this.levelPlatforms.push(platform);
        return platform;
    }

    // Совместимость для старых систем/abilities. Новый StageSystem не использует.
    addStaticPlatformLegacy(
        x,
        y,
        width,
        height,
        stageIndex,
        rowIndex,
        isGround = false,
        visual = null,
        surfaceInset = 0
    ) {
        return this.addStaticPlatform({
            x,
            y,
            width,
            height,
            stageIndex,
            rowIndex,
            isGround,
            texture: null,
            displayWidth: visual?.displayWidth ?? width,
            displayHeight: visual?.displayHeight ?? height,
            surfaceInset
        });
    }

    attachPlayer(playerBody) {
        if (!playerBody) return;

        for (const platform of this.levelPlatforms) {
            this.attachBodyToPlatform(playerBody, platform);
        }

        for (const platform of this.movingPlatforms) {
            if (platform?.body) {
                this.scene.physics.add.collider(playerBody, platform);
            }
        }
    }

    attachEnemy(enemyBody) {
        if (!enemyBody) return;

        for (const platform of this.levelPlatforms) {
            this.attachBodyToPlatform(enemyBody, platform);
        }

        for (const platform of this.movingPlatforms) {
            if (platform?.body) {
                this.scene.physics.add.collider(enemyBody, platform);
            }
        }
    }

    attachBodyToPlatform(body, platform) {
        if (!body || !platform?.collider?.body) return;
        if (platform.attachedBodies.has(body)) return;

        const collider = this.scene.physics.add.collider(
            body,
            platform.collider
        );

        platform.attachedBodies.add(body);
        body._worldPlatformColliders ??= [];
        body._worldPlatformColliders.push(collider);
    }

    getGroundY() {
        const ground = this.levelPlatforms.find(p => p.isGround);
        return ground
            ? ground.surfaceY
            : this.scene.worldHeight - 56;
    }

    groundY(x) {
        let best = this.getGroundY();

        for (const platform of this.levelPlatforms) {
            if (platform.isGround) continue;

            const left = platform.x - platform.width / 2;
            const right = platform.x + platform.width / 2;

            if (x < left || x > right) continue;
            if (platform.surfaceY < best) best = platform.surfaceY;
        }

        return best;
    }

    getSpawnSurface(x, preferredRow, stageIndex) {
        if (preferredRow === -1) return this.getGroundY();

        const exact = this.levelPlatforms.find(platform =>
            platform.stageIndex === stageIndex &&
            platform.rowIndex === preferredRow &&
            x >= platform.x - platform.width / 2 + 24 &&
            x <= platform.x + platform.width / 2 - 24
        );

        if (exact) return exact.surfaceY;

        const fallback = this.findNearestLowerSurface(
            x,
            Number.POSITIVE_INFINITY,
            stageIndex
        );

        return fallback?.surfaceY ?? this.getGroundY();
    }

    findNearestLowerSurface(x, fromY, stageIndex = this.scene.currentStageIndex ?? 0) {
        let best = null;

        for (const platform of this.levelPlatforms) {
            if (platform.stageIndex !== stageIndex) continue;
            if (x < platform.x - platform.width / 2 || x > platform.x + platform.width / 2) continue;
            if (platform.surfaceY >= fromY) continue;

            if (!best || platform.surfaceY > best.surfaceY) {
                best = platform;
            }
        }

        return best;
    }

    createMovingPlatforms() {
        const scene = this.scene;
        const cfg = scene.CONFIG.MOVING_PLATFORMS;

        this.movingPlatforms.length = 0;

        for (let stage = 0; stage < this.stageCount; stage++) {
            const left = this.stageStart(stage);
            const rows = [0.52, 0.42, 0.32];

            for (let i = 0; i < cfg.perStage; i++) {
                const width = Phaser.Math.Between(
                    cfg.widthMin,
                    Math.min(
                        cfg.widthMax,
                        Math.floor(scene.stageWidth * 0.24)
                    )
                );

                const y = scene.worldHeight * rows[i % rows.length];
                const x = left + (scene.stageWidth * (i + 1)) / (cfg.perStage + 1);

                const platform = scene.add
                    .rectangle(x, y, width, cfg.height, 0x555a73, 1)
                    .setDepth(11);

                platform.setStrokeStyle(1, 0x9ba2c2);
                scene.physics.add.existing(platform);
                platform.body.setAllowGravity(false);
                platform.body.setImmovable(true);
                platform.body.checkCollision.down = false;
                platform.body.checkCollision.left = false;
                platform.body.checkCollision.right = false;

                platform.platformSpeed = Phaser.Math.Between(cfg.speedMin, cfg.speedMax);
                platform.platformDirection = -1;
                platform.stageIndex = stage;
                platform.platformWidth = width;
                platform.body.setVelocityX(-platform.platformSpeed);

                this.movingPlatforms.push(platform);
            }
        }

        this.syncSceneReferences();
    }

    updateMovingPlatforms() {
        const scene = this.scene;

        for (const platform of this.movingPlatforms) {
            if (!platform?.active || !platform.body) continue;

            const left = this.stageStart(platform.stageIndex);
            const right = this.stageEnd(platform.stageIndex);
            const margin = platform.platformWidth / 2 + 24;

            platform.body.setVelocityX(-platform.platformSpeed);

            if (platform.x < left - margin) {
                platform.x = right + margin;
                platform.body.reset(platform.x, platform.y);
                platform.body.setVelocityX(-platform.platformSpeed);
            }
        }
    }

    transitionToStage(index) {
        const clamped = Phaser.Math.Clamp(index, 0, this.stageCount - 1);
        this.scene.currentStageIndex = clamped;
        this.applyStageCameraBounds();
        return clamped;
    }

    applyStageCameraBounds() {
        const scene = this.scene;
        const cam = scene.cameras.main;
        const playerBody = scene.playerBody?.body;

        cam.setBounds(0, 0, scene.worldWidth, scene.worldHeight);

        if (playerBody) {
            cam.startFollow(
                playerBody,
                true,
                scene.CONFIG.CAMERA.lerpX,
                scene.CONFIG.CAMERA.lerpY ?? scene.CONFIG.CAMERA.lerpX
            );
        }
    }

    getStageIndexAtX(x) {
        return Phaser.Math.Clamp(
            Math.floor(x / this.scene.stageWidth),
            0,
            this.stageCount - 1
        );
    }

    handleResize(gameSize) {
        this.scene.viewportWidth = Math.max(640, Math.floor(gameSize.width));
        this.scene.viewportHeight = Math.max(360, Math.floor(gameSize.height));
        this.applyStageCameraBounds();
    }

    update() {
        this.updateMovingPlatforms();
        this.updateBackgrounds();
    }
}
