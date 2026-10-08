import { GAME_CONFIG } from '../config/gameConfig.js';
import { CONTROLS } from '../config/controlConfig.js';
import { getControls } from './system/SaveSystem.js';
import { ABILITIES } from './mechanics/abilities.js';
import { StageSystem } from './system/StageSystem.js';
import { BackgroundSystem } from './system/BackgroundSystem.js';
import { MinimapSystem } from './system/MinimapSystem.js';
import { EventBus } from './core/EventBus.js';
import { CharacterSystem } from './system/CharacterSystem.js';
import { RecipeSystem } from './system/RecipeSystem.js';
import { CombatSystem } from './system/CombatSystem.js';
import { PauseSystem } from './system/PauseSystem.js';
import { SuperSystem } from './system/SuperSystem.js';
import { CheatSystem } from './system/CheatSystem.js';
import { getEnemyData } from './data/enemies/enemies.js';
import { DialogueSystem } from './system/DialogueSystem.js';
import { ProjectileSystem } from './system/ProjectileSystem.js';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });

        this.CONFIG = GAME_CONFIG;
    }

    init(data) {
        this.selectedStageIndex = Number.isInteger(data?.stageIndex) ? data.stageIndex : 0;
        this.selectedStageIndex = Phaser.Math.Clamp(this.selectedStageIndex, 0, Math.max(0, (StageSystem.count?.() ?? 2) - 1));
        this.characterId = data?.characterId || this.registry.get('characterId') || 'ingor';
        this.currentStageIndex = 0;
    }

    preload() {
        // ============================================================
        // AVRON 2.0 — ASSET MANIFEST
        // Все эти файлы пользователь может заменить своими PNG.
        // Если меняешь внешний вид — код уровня трогать не нужно.
        // ============================================================
        const ingorFrames = [
            ['ingor_idle_1', 'assets/player/Ingor/ingor_idle_1.png'],
            ['ingor_idle_2', 'assets/player/Ingor/ingor_idle_2.png'],
            ['ingor_walk_1', 'assets/player/Ingor/ingor_walk_1.png'],
            ['ingor_walk_2', 'assets/player/Ingor/ingor_walk_2.png'],
            ['ingor_jump_1', 'assets/player/Ingor/ingor_jump_1.png'],
            ['ingor_jump_2', 'assets/player/Ingor/ingor_jump_2.png']
        ];
        const criacFrames = [
            ['criac_idle_1', 'assets/player/Criac/criac_idle_1.png'],
            ['criac_idle_2', 'assets/player/Criac/criac_idle_2.png'],
            ['criac_walk_1', 'assets/player/Criac/criac_walk_1.png'],
            ['criac_walk_2', 'assets/player/Criac/criac_walk_2.png'],
            ['criac_jump_1', 'assets/player/Criac/criac_jump_1.png'],
            ['criac_jump_2', 'assets/player/Criac/criac_jump_2.png'],
            ['criac_attack_1', 'assets/player/Criac/criac_attack_1.png'],
            ['criac_attack_2', 'assets/player/Criac/criac_attack_2.png'],
            ['criac_attack_3', 'assets/player/Criac/criac_attack_3.png'],
            ['criac_attack_4', 'assets/player/Criac/criac_attack_4.png'],
            ['criac_cast_1', 'assets/player/Criac/criac_cast_1.png'],
            ['criac_cast_2', 'assets/player/Criac/criac_cast_2.png'],
            ['criac_aura', 'assets/player/Criac/criac_aura.png']
        ];
        for (const [key, path] of [...ingorFrames, ...criacFrames]) this.load.image(key, path);
        this.load.image('player_aura', 'assets/player/aura.png');
        this.load.image('p_idle_1', 'assets/player/Ingor/ingor_walk_2.png');
        this.load.image('p_idle_2', 'assets/player/Ingor/ingor_walk_2.png');
        this.load.image('p_walk_1', 'assets/player/Ingor/ingor_walk_2.png');
        this.load.image('p_walk_2', 'assets/player/Ingor/ingor_walk_2.png');
        this.load.image('p_jump_1', 'assets/player/Ingor/ingor_walk_2.png');
        this.load.image('p_jump_2', 'assets/player/Ingor/ingor_walk_2.png');
        this.load.image('enemy', 'assets/enemy.png');
        this.load.image('fireball', 'assets/fireball.png');

        // BACKGROUND
        this.load.image('terrain_bg_far', 'assets/terrain/terrain_bg_far.png');
        this.load.image('terrain_bg_mid', 'assets/terrain/terrain_bg_mid.png');
        this.load.image('terrain_fog', 'assets/terrain/terrain_fog.png');

        // ASH PARALLAX BACKGROUNDS
        const ashBackgrounds = [
            ['bg_ash_far_01', 'assets/terrain/bg_ash_far_01.png'],
            ['bg_ash_far_02', 'assets/terrain/bg_ash_far_02.png'],
            ['bg_ash_far_03', 'assets/terrain/bg_ash_far_03.png'],
            ['bg_ash_mid_01', 'assets/terrain/bg_ash_mid_01.png'],
            ['bg_ash_mid_02', 'assets/terrain/bg_ash_mid_02.png'],
            ['bg_ash_near_01', 'assets/terrain/bg_ash_near_01.png'],
            ['bg_ash_near_02', 'assets/terrain/bg_ash_near_02.png']
        ];
        for (const [key, path] of ashBackgrounds) this.load.image(key, path);

        // TERRAIN / ROAD
        this.load.image('terrain_ground', 'assets/terrain/terrain_ground.png');
        this.load.image('terrain_road', 'assets/terrain/terrain_road.png');
        this.load.image('terrain_platform', 'assets/terrain/terrain_platform.png');
        this.load.image('terrain_bridge', 'assets/terrain/terrain_bridge.png');
        this.load.image('terrain_ledge', 'assets/terrain/terrain_ledge.png');

        // DECORATION
        this.load.image('terrain_pillar', 'assets/terrain/terrain_pillar.png');
        this.load.image('terrain_arch', 'assets/terrain/terrain_arch.png');
        this.load.image('terrain_rock', 'assets/terrain/terrain_rock.png');

        // SIGILS
        this.load.image('sigil_flame', 'assets/sigils/flame.png');
        this.load.image('sigil_shadow', 'assets/sigils/shadow.png');
        this.load.image('sigil_ether', 'assets/sigils/ether.png');
        this.load.image('sigil_gravis', 'assets/sigils/gravis.png');
        this.load.image('sigil_water', 'assets/sigils/water.png');
        this.load.image('sigil_light', 'assets/sigils/light.png');
        this.load.image('sigil_time', 'assets/sigils/time.png');

        // UI — декоративные рамки. Если пока нет — fallback UI всё равно создастся.
        // UI — пользовательский Echo frame. Остальные рамки не грузим: HUD имеет fallback.
        this.load.image('ui_echo_frame', 'assets/ui_echo_frame.png');
    }

    create() {
        this.viewportWidth = Math.max(640, Math.floor(this.scale.width));
        this.viewportHeight = Math.max(360, Math.floor(this.scale.height));
        this.stageWidth = this.CONFIG.WORLD.width;
        this.worldWidth = this.CONFIG.WORLD.width;
        this.worldHeight = this.selectedStageIndex === 1 ? 600 : (this.CONFIG.WORLD.height ?? 1200);

        this.lastCastText = '—';
        this.characterData = CharacterSystem.get(this.characterId);
        this.player = { stats: { ...this.CONFIG.PLAYER, ...(this.characterData?.stats ?? {}) } };
        this.recipeSystem = new RecipeSystem(this.characterId);
        this.playerHP = this.player.stats.maxHP;
        this.gameOver = false;
        this.isCleaningUp = false;
        this.hitstopUntil = 0;
        this.isPaused = false;
        this.recipePanelVisible = false;
        this.gems = 0;
        this.gemsWorld = [];
        this.attackKeyDown = false;
        this.eventBus = new EventBus();
        this.eventBusOffKill = null;
        this.killCount = 0;
        this.activeStageData = StageSystem.data(this.selectedStageIndex);
        this.stageRespawnTimers = new Map();
        this.eventBusOffKill = this.eventBus.on('enemy:killed', data => {
            this.killCount = data.total ?? this.killCount;
            this.updateStageUI();
        });

        this.bossDefeatCount = 0;
        this.dialogueSystem = new DialogueSystem(this);

        this.createFallbackTextures();
        this.createWorld();
        this.createGroups();
        this.createPlatforms();
        this.createPlayer();
        this.createMovingPlatforms();
        this.createEnemies();

        const initialStageId = this.getBackgroundStageId(this.currentStageIndex);
        this.backgroundSystem.create(initialStageId);

        this.minimapSystem = new MinimapSystem(this, {
            width: this.CONFIG.MINIMAP?.width ?? 250,
            height: this.CONFIG.MINIMAP?.height ?? 96,
            margin: this.CONFIG.MINIMAP?.margin ?? 18,
            updateInterval: this.CONFIG.MINIMAP?.updateInterval ?? 80
        });
        this.layoutHUDPanels();

        this.createInput();
        this.combatSystem = new CombatSystem(this);
        this.superSystem = new SuperSystem(this);
        this.cheatSystem = new CheatSystem(this);
        this.createUI();
        this.createRecipePanel();
        this.pauseSystem = new PauseSystem(this).create();
        this.setupCamera();

        // Тестовый диалог в начале первой стадии. Во время диалога весь gameplay заморожен.
        if (this.selectedStageIndex === 0) {
            this.time.delayedCall(350, () => this.startBossIntroDialogue());
        }
        this.updateUI();
        this.updateHPUI();
        this.updateStageUI();

        this.scale.on('resize', this.handleResize, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
    }

    createFallbackTextures() {
        
        if (!this.textures.exists('enemy')) {
            const g = this.make.graphics({ add: false });
            g.fillStyle(0x9d6cff, 1);
            g.fillRoundedRect(5, 3, 42, 62, 10);
            g.fillStyle(0x100d1a, 1);
            g.fillCircle(18, 25, 5);
            g.fillCircle(34, 25, 5);
            g.generateTexture('enemy', 52, 68);
            g.destroy();
        }
        if (!this.textures.exists('fireball')) {
            const g = this.make.graphics({ add: false });
            g.fillStyle(0xffa13a, 1);
            g.fillCircle(9, 9, 8);
            g.fillStyle(0xffe0a0, 1);
            g.fillCircle(9, 9, 3);
            g.generateTexture('fireball', 18, 18);
            g.destroy();
        }
        const sigils = [
            ['sigil_flame', 0xff8844],
            ['sigil_shadow', 0x8c6cff],
            ['sigil_ether', 0x62d9ff],
            ['sigil_gravis', 0xb9a0ff],
            ['sigil_water', 0x4ea7ff],
            ['sigil_light', 0xfff3a1],
            ['sigil_time', 0xd69cff]
        ];
        for (const [key, color] of sigils) {
            if (this.textures.exists(key)) continue;
            const g = this.make.graphics({ add: false });
            g.fillStyle(color, 1);
            g.fillCircle(22, 22, 18);
            g.lineStyle(3, 0xffffff, 0.65);
            g.strokeCircle(22, 22, 14);
            g.generateTexture(key, 44, 44);
            g.destroy();
        }
        if (!this.textures.exists('space')) {
            const g = this.make.graphics({ add: false });
            g.fillStyle(0x080812, 1);
            g.fillRect(0, 0, 64, 64);
            for (let i = 0; i < 12; i++) {
                g.fillStyle(0x666688, Phaser.Math.FloatBetween(0.15, 0.5));
                g.fillCircle(Phaser.Math.Between(2, 62), Phaser.Math.Between(2, 62), 1);
            }
            g.generateTexture('space', 64, 64);
            g.destroy();
        }
    }

    createWorld() {
        // Физический мир конечный. Фон больше НЕ является частью world texture.
        this.worldHeight = this.selectedStageIndex === 1 ? 600 : (this.CONFIG.WORLD.height ?? 1200);
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.setBackgroundColor('#080812');

        // BackgroundSystem живёт отдельно от физики и камеры мира.
        this.backgroundSystem = new BackgroundSystem(this);

        // На второй карте кроме дороги и платформ не используем другие terrain PNG.
        // Первая карта сохраняет старые архитектурные декорации.
        if (this.selectedStageIndex === 0) {
            const decor = [
                { key: 'terrain_arch', x: 900, y: this.worldHeight - 240, w: 420, h: 420, depth: -2 },
                { key: 'terrain_pillar', x: 2250, y: this.worldHeight - 260, w: 150, h: 520, depth: 8 },
                { key: 'terrain_arch', x: 3850, y: this.worldHeight - 250, w: 460, h: 430, depth: -2 },
                { key: 'terrain_pillar', x: 5200, y: this.worldHeight - 260, w: 150, h: 520, depth: 8 },
                { key: 'terrain_rock', x: 6700, y: this.worldHeight - 170, w: 320, h: 220, depth: 8 },
                { key: 'terrain_arch', x: 8050, y: this.worldHeight - 250, w: 440, h: 430, depth: -2 },
                { key: 'terrain_pillar', x: 9600, y: this.worldHeight - 260, w: 150, h: 520, depth: 8 },
                { key: 'terrain_rock', x: 11100, y: this.worldHeight - 170, w: 360, h: 240, depth: 8 },
                { key: 'terrain_arch', x: 12600, y: this.worldHeight - 250, w: 500, h: 440, depth: -2 },
                { key: 'terrain_pillar', x: 13700, y: this.worldHeight - 260, w: 150, h: 520, depth: 8 }
            ];
            for (const d of decor) {
                this.add.image(d.x, d.y, d.key)
                    .setDisplaySize(d.w, d.h)
                    .setOrigin(0.5, 1)
                    .setDepth(d.depth);
            }
        }
    }

    stageStart(index) {
        return index * this.stageWidth;
    }

    stageEnd(index) {
        return (index + 1) * this.stageWidth;
    }

    stageCenter(index) {
        return this.stageStart(index) + this.stageWidth / 2;
    }

    getBackgroundStageId(index = this.currentStageIndex) {
        const stageData = StageSystem.data?.(this.selectedStageIndex ?? index);
        return stageData?.id ??
            `stage_${String(index + 1).padStart(2, '0')}`;
    }

    createPlatforms() {
        this.levelPlatforms = [];
        this.stageSpawnPoints = [[]];

        const data = this.activeStageData;
        const h = this.worldHeight;
        const ph = this.CONFIG.PLATFORM.height;
        const stageIndex = 0;

        if (this.selectedStageIndex === 0) {
            // Стадия 1 сохраняет исходную разбивку дороги на сегменты.
            const roadSegments = [
                [0, 1800], [1800, 3600], [3600, 5400], [5400, 7200],
                [7200, 9000], [9000, 10800], [10800, 12600], [12600, 14000]
            ];
            for (const [left, right] of roadSegments) {
                const cx = (left + right) / 2;
                const rw = right - left + 12;
                const road = this.add.image(cx, h - 32, data.ground.texture)
                    .setDisplaySize(rw, data.ground.displayHeight)
                    .setOrigin(0.5, 1)
                    .setDepth(data.ground.depth ?? 10);
                this.addStaticPlatform(cx, h - 28, rw, 56, stageIndex, -1, true, road, data.ground.surfaceInset ?? 0);
            }
        } else {
            const road = this.add.image(this.worldWidth / 2, h - 32, data.ground.texture)
                .setDisplaySize(this.worldWidth + 12, data.ground.displayHeight)
                .setOrigin(0.5, 1)
                .setDepth(data.ground.depth ?? 10);
            this.addStaticPlatform(this.worldWidth / 2, h - 28, this.worldWidth + 12, 56, stageIndex, -1, true, road, data.ground.surfaceInset ?? 0);
        }

        for (let i = 0; i < data.upperPlatforms.length; i++) {
            const item = data.upperPlatforms[i];
            const visual = this.add.image(item.x, item.y, item.texture)
                .setDisplaySize(item.width, item.height)
                .setOrigin(item.origin?.x ?? 0.5, item.origin?.y ?? 0.5)
                .setDepth(item.depth ?? 10);

            this.addStaticPlatform(
                item.x,
                item.y,
                item.physics?.width ?? item.width * 0.92,
                item.physics?.height ?? ph,
                stageIndex,
                i,
                false,
                visual,
                item.physics?.surfaceInset ?? 18
            );
        }

        this.stageSpawnPoints[0] = data.spawns.map(point => ({ ...point }));
    }

    addStaticPlatform(x, y, width, height, stageIndex, rowIndex, isGround = false, visual = null, surfaceInset = 0) {
        if (!visual) {
            visual = this.add.rectangle(x, y, width, height, isGround ? 0x30334b : 0x3c405d, 1)
                .setDepth(10);
        }

        // Physics intentionally uses the ORIGINAL 2.0 surface coordinates.
        // The PNG is only a visual layer; its bounds must not move the gameplay surface.
        const surfaceY = y - height / 2;
        const collider = this.add.rectangle(x, y, width, height, 0xffffff, 0);
        this.physics.add.existing(collider, true);
        collider.visible = false;
        if (!isGround) {
            collider.body.checkCollision.down = false;
            collider.body.checkCollision.left = false;
            collider.body.checkCollision.right = false;
        }

        this.levelPlatforms.push({
            x, y, width, height, isGround,
            surfaceY, stageIndex, rowIndex, visual, collider
        });
    }

    getGroundY() {
        const ground = this.levelPlatforms?.find(p => p.isGround);
        return ground ? ground.surfaceY : this.worldHeight - 56;
    }

    groundY(x) {
        let best = this.getGroundY();
        for (const p of this.levelPlatforms) {
            if (p.isGround) continue;
            if (x >= p.x - p.width / 2 && x <= p.x + p.width / 2 && p.surfaceY < best) {
                best = p.surfaceY;
            }
        }
        return best;
    }

    createGroups() {
        this.projectiles = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.remnants = [];
        this.movingPlatforms = [];
    }

    resolvePlayerTexture(key, fallback = 'ingor_walk_2') {
        for (const candidate of [key, fallback, 'ingor_walk_2', 'p_idle_1']) {
            if (candidate && this.textures.exists(candidate)) return candidate;
        }
        return null;
    }

    createPlayer() {
        const spawnX = 260;
        const stats = this.player.stats;
        const surfaceY = this.groundY(spawnX);
        const bodyWidth = stats.bodyWidth ?? this.CONFIG.PLAYER.bodyWidth;
        const bodyHeight = stats.bodyHeight ?? this.CONFIG.PLAYER.bodyHeight;
        const visualWidth = stats.visualWidth ?? this.CONFIG.PLAYER.visualWidth;
        const visualHeight = stats.visualHeight ?? this.CONFIG.PLAYER.visualHeight;

        this.playerBody = this.add.rectangle(
            spawnX,
            surfaceY - bodyHeight / 2,
            bodyWidth,
            bodyHeight,
            0xffffff,
            0
        );
        this.physics.add.existing(this.playerBody);
        this.playerBody.body.setCollideWorldBounds(true);
        this.playerBody.body.setGravityY(stats.gravity ?? this.CONFIG.PLAYER.gravity);
        this.playerBody.body.setSize(bodyWidth, bodyHeight);

        const explicitIdle = this.characterId === 'ingor'
            ? 'ingor_idle_1'
            : this.characterId === 'criac'
                ? 'criac_idle_1'
                : (stats.visual?.idle1 ?? this.characterData?.visual?.idle1);
        const visualKey = this.resolvePlayerTexture(explicitIdle, this.characterData?.visual?.fallback ?? (this.characterId === 'criac' ? 'criac_walk_2' : 'ingor_idle_1'));
        this.playerSprite = this.add.image(spawnX, surfaceY, visualKey)
            .setDisplaySize(visualWidth, visualHeight)
            .setOrigin(0.5, 1)
            .setTint(this.characterData?.visual?.tint ?? 0xffffff)
            .setDepth(20);

        this.playerBody.facing = 1;
        this.playerBody.canDoubleJump = false;
        this.playerBody.canDash = false;
        this.playerBody.lastAttack = 0;
        this.playerBody.invulnerableUntil = 0;
        this.playerBody.isInvisible = false;
        this.playerBody.maxHP = stats.maxHP ?? this.CONFIG.PLAYER.maxHP;
        this.playerBody.jumpAnimation = 'normal';
        this.playerBody.form = 'normal';
        this.playerBody.superFormUntil = 0;
        this.playerBody.superMeter = 0;
        this.playerBody.baseStats = { ...stats };

        this.playerAnimation = {
            state: 'idle', frame: 1, timer: 0,
            overrideType: null, overrideUntil: 0, frameDelay: 80,
            attackVisual: null, attackVisualUntil: 0, attackIdleGapUntil: 0
        };

        for (const p of this.levelPlatforms) this.physics.add.collider(this.playerBody, p.collider);
    }

    syncPlayerVisual() {
        if (!this.playerBody?.body || !this.playerSprite) return;
        const reachOffset = this.playerAnimation?.reachOffsetX ?? 0;
        const facing = this.playerBody.facing || 1;
        this.playerSprite.x = this.playerBody.x + reachOffset * facing;
        this.playerSprite.y = this.playerBody.body.bottom;
        this.playerSprite.setFlipX(this.playerBody.facing < 0);
    }
    updatePlayerAnimation(delta) {
        if (!this.playerBody?.body || !this.playerSprite) return;
        const body = this.playerBody.body;
        const combat = this.combatSystem;
        const now = this.time.now;
        if (this.dialogueSystem?.active || this.isPaused || this.gameOver) return;

        const hasMoveInputNow = Boolean(this.keys?.left?.isDown || this.keys?.right?.isDown);
        if (combat?.type === 'normal' && combat.state !== 'idle' && hasMoveInputNow) combat.reset();

        // Боевые состояния имеют абсолютный приоритет над walk/idle только пока атака продолжается.
        if (this.playerAnimation.attackIdleGapUntil > now) {
            this.setPlayerAnimationFrame('idle', 1);
            return;
        }

        if (combat?.state === 'charging') {
            // Charge появляется только после полной 1 секунды удержания.
            // До этого обычное нажатие ещё не считается charge.
            if (now - (combat.chargeStartedAt ?? now) >= 1000) {
                this.setPlayerAnimationFrame('attack1', 1);
            } else {
                this.setPlayerAnimationFrame('idle', 1);
            }
            return;
        }

        if (combat && combat.state !== 'idle') {
            if (combat.type === 'up') {
                const rising = (body.velocity?.y ?? 0) < 30;
                this.setPlayerAnimationFrame(
                    rising ? (this.characterId === 'criac' ? 'attack3' : 'jump2') : 'jump1',
                    1
                );
                return;
            }
            if (combat.type === 'strong') {
                this.setPlayerAnimationFrame('attack4', 1);
                return;
            }
            if (combat.type === 'normal' || combat.type === 'move') {
                this.setPlayerAnimationFrame('attack2', 1);
                return;
            }
        }

        if (this.playerAnimation.overrideUntil > now) {
            this.setPlayerAnimationFrame(this.playerAnimation.overrideType, this.playerAnimation.frame);
            return;
        }

        const hasMoveInput = Boolean(this.keys?.left?.isDown || this.keys?.right?.isDown);
        const state = !body.blocked.down
            ? (body.velocity.y < 30 ? 'jump2' : 'jump1')
            : (hasMoveInput && Math.abs(body.velocity.x) > 8 ? 'walk' : 'idle');

        if (state !== this.playerAnimation.state) {
            this.playerAnimation.state = state;
            this.playerAnimation.frame = 1;
            this.playerAnimation.timer = 0;
            this.setPlayerAnimationFrame(state, 1);
            return;
        }

        this.playerAnimation.timer += delta;
        const frameDelay = state === 'idle' ? 420 : (this.characterId === 'criac' && state === 'walk' ? 150 : 110);
        if (this.playerAnimation.timer >= frameDelay) {
            this.playerAnimation.timer = 0;
            this.playerAnimation.frame = this.playerAnimation.frame === 1 ? 2 : 1;
            this.setPlayerAnimationFrame(state, this.playerAnimation.frame);
        }
    }

    setPlayerAnimationFrame(state, frame = 1) {
        const visual = this.characterData?.visual ?? {};
        // Арт Ингора не берём из старых p_* fallback: idle должен быть idle_1/2.
        const map = this.characterId === 'ingor' ? {
            idle: frame === 1 ? 'ingor_idle_1' : 'ingor_idle_2',
            walk: frame === 1 ? 'ingor_walk_1' : 'ingor_walk_2',
            jump1: 'ingor_jump_1',
            jump2: 'ingor_jump_2',
            attack1: visual.attack1,
            attack2: visual.attack2,
            attack3: visual.attack3,
            attack4: visual.attack4,
            cast: visual[`cast${Phaser.Math.Clamp(frame, 1, 2)}`],
            aura: 'aura'
        } : {
            idle: frame === 1 ? (visual.idle1 ?? 'criac_idle_1') : (visual.idle2 ?? 'criac_idle_2'),
            walk: frame === 1 ? (visual.walk1 ?? 'criac_walk_1') : (visual.walk2 ?? 'criac_walk_2'),
            jump1: visual.jump1 ?? 'criac_jump_1',
            jump2: visual.jump2 ?? 'criac_jump_2',
            attack1: visual.attack1,
            attack2: visual.attack2,
            attack3: visual.attack3,
            attack4: visual.attack4,
            cast: visual[`cast${Phaser.Math.Clamp(frame, 1, 2)}`],
            aura: 'aura'
        };
        const stateFallbacks = {
            idle: this.characterId === 'criac' ? 'criac_idle_1' : 'ingor_idle_1',
            walk: this.characterId === 'criac' ? 'criac_walk_1' : 'ingor_walk_1',
            jump1: this.characterId === 'criac' ? 'criac_jump_1' : 'ingor_jump_1',
            jump2: this.characterId === 'criac' ? 'criac_jump_2' : 'ingor_jump_2',
            attack1: this.characterId === 'criac' ? 'criac_attack_1' : 'ingor_walk_2',
            attack2: this.characterId === 'criac' ? 'criac_attack_2' : 'ingor_walk_2',
            attack3: this.characterId === 'criac' ? 'criac_attack_3' : 'ingor_walk_2',
            attack4: this.characterId === 'criac' ? 'criac_attack_4' : 'ingor_walk_2'
        };
        const texture = this.resolvePlayerTexture(map[state], stateFallbacks[state] ?? visual.fallback);
        if (texture) {
            if (this.playerSprite.texture?.key !== texture) this.playerSprite.setTexture(texture);
            // Все кадры персонажа имеют одинаковую игровую область, даже если
            // исходный PNG имеет другой размер. Это особенно важно для criac_attack_3.
            const width = this.characterData?.stats?.visualWidth ?? this.player?.stats?.visualWidth ?? this.CONFIG.PLAYER.visualWidth;
            const height = this.characterData?.stats?.visualHeight ?? this.player?.stats?.visualHeight ?? this.CONFIG.PLAYER.visualHeight;
            const visualScale = this.characterId === 'criac' ? 1.10 : 1;
            let displayWidth = width * visualScale;
            let displayHeight = height * visualScale;
            this.playerAnimation.reachOffsetX = 0;
            if (state === 'attack2') { displayWidth *= 1.55; displayHeight *= 1.03; this.playerAnimation.reachOffsetX = 24; }
            else if (state === 'attack4') { displayWidth *= 1.72; displayHeight *= 1.06; this.playerAnimation.reachOffsetX = 30; }
            this.playerSprite.setDisplaySize(displayWidth, displayHeight);
            this.playerSprite.setOrigin(0.5, 1);
        }
    }

    setPlayerVisualOverride(type, duration = 320, frameDelay = 80) {
        this.playerAnimation.overrideType = type;
        this.playerAnimation.overrideUntil = this.time.now + duration;
        this.playerAnimation.frame = 1;
        this.playerAnimation.timer = 0;
        this.playerAnimation.frameDelay = frameDelay;
        this.setPlayerAnimationFrame(type, 1);
    }

    createMovingPlatforms() {
        const cfg = this.CONFIG.MOVING_PLATFORMS;
        this.movingPlatforms = [];

        // Движение только влево. Когда платформа полностью уходит за левый
        // край своего Stage, она появляется справа. Поэтому сама последовательность
        // платформ образует бесконечно закольцованный горизонтальный поток.
        for (let stage = 0; stage < this.CONFIG.STAGE.count; stage++) {
            const left = this.stageStart(stage);
            const rows = [0.52, 0.42, 0.32];
            for (let i = 0; i < cfg.perStage; i++) {
                const width = Phaser.Math.Between(cfg.widthMin, Math.min(cfg.widthMax, Math.floor(this.stageWidth * 0.24)));
                const y = this.worldHeight * rows[i % rows.length];
                const x = left + (this.stageWidth * (i + 1)) / (cfg.perStage + 1);
                const platform = this.add.rectangle(x, y, width, cfg.height, 0x555a73, 1).setDepth(11);
                platform.setStrokeStyle(1, 0x9ba2c2);
                this.physics.add.existing(platform);
                platform.body.setAllowGravity(false);
                platform.body.setImmovable(true);
                // Только верхняя сторона является опорой. Снизу/сбоку платформа
                // не может зажать персонажа между этажами.
                platform.body.checkCollision.down = false;
                platform.body.checkCollision.left = false;
                platform.body.checkCollision.right = false;
                platform.platformSpeed = Phaser.Math.Between(cfg.speedMin, cfg.speedMax);
                platform.platformDirection = -1;
                platform.stageIndex = stage;
                platform.platformWidth = width;
                platform.body.setVelocityX(-platform.platformSpeed);
                this.movingPlatforms.push(platform);
                this.physics.add.collider(this.playerBody, platform);
            }
        }
    }

    updateMovingPlatforms() {
        for (const p of this.movingPlatforms) {
            if (!p?.active || !p.body) continue;
            const left = this.stageStart(p.stageIndex);
            const right = this.stageEnd(p.stageIndex);
            p.body.setVelocityX(-p.platformSpeed);
            const margin = p.platformWidth / 2 + 24;
            if (p.x < left - margin) {
                p.x = right + margin;
                p.body.reset(p.x, p.y);
                p.body.setVelocityX(-p.platformSpeed);
            }
        }
    }

    createEnemies() {
        // Stage 2 — отдельная арена на 100 убийств.
        // Враги возвращаются, поэтому игрок не может физически закончить её
        // после четырёх стартовых спавнов.
        const configuredObjective = this.activeStageData.objective ?? {};
        const isSecondStage = this.selectedStageIndex === 1;
        const target = isSecondStage ? 100 : (configuredObjective.targetKills ?? 0);
        const respawnEnabled = isSecondStage || Boolean(configuredObjective.respawnEnabled);
        const respawnLimit = isSecondStage ? 100 : (configuredObjective.respawnsPerSlot ?? 0);

        this.stageStates = [{
            index: 0,
            start: 0,
            end: this.worldWidth,
            started: false,
            cleared: false,
            enemiesTotal: this.stageSpawnPoints[0]?.length ?? 0,
            enemiesRemaining: this.stageSpawnPoints[0]?.length ?? 0,
            kills: 0,
            targetKills: target,
            respawnEnabled,
            respawnLimit,
            respawnsBySpawn: []
        }];

        this.currentStageIndex = 0;
        this.stageLocked = false;
        this.startStage(0);
    }

    startStage(index) {
        const stage = this.stageStates[index];
        if (!stage || stage.started) return;
        stage.started = true;

        const points = this.stageSpawnPoints[index] || [];
        stage.enemiesRemaining = points.length;
        stage.respawnsBySpawn = points.map(() => 0);

        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const surface = this.getSpawnSurface(point.x, point.row, index);
            this.spawnEnemy(point.x, surface, index, i, point.type ?? 'grunt', point);
        }

        this.currentStageIndex = index;
        this.stageLocked = false;
        this.applyStageCameraBounds();
    }

    getSpawnSurface(x, preferredRow, stageIndex) {
        if (preferredRow === -1) return this.getGroundY();
        const candidates = this.levelPlatforms.filter(p =>
            p.stageIndex === stageIndex &&
            p.rowIndex === preferredRow &&
            x >= p.x - p.width / 2 + 24 &&
            x <= p.x + p.width / 2 - 24
        );
        if (candidates.length) return candidates[0].surfaceY;

        let best = null;
        for (const p of this.levelPlatforms) {
            if (p.stageIndex !== stageIndex) continue;
            if (x < p.x - p.width / 2 + 24 || x > p.x + p.width / 2 - 24) continue;
            if (!best || Math.abs(p.rowIndex - preferredRow) < Math.abs(best.rowIndex - preferredRow)) best = p;
        }
        return best ? best.surfaceY : this.getGroundY();
    }

    spawnEnemy(x, surfaceY, stageIndex, spawnIndex = 0, typeId = 'grunt', spawnData = {}) {
        const data = getEnemyData(typeId);
        const bodyConfig = data.body ?? { width: 30, height: 58 };
        const visualConfig = data.visual ?? { width: 52, height: 68, originY: 1, depth: 20 };
        const physicsConfig = data.physics ?? {};

        const body = this.add.rectangle(
            x,
            surfaceY - bodyConfig.height / 2,
            bodyConfig.width,
            bodyConfig.height,
            0xffffff,
            0
        );
        this.physics.add.existing(body);
        body.body.setCollideWorldBounds(true);
        body.body.setAllowGravity(physicsConfig.allowGravity !== false);
        body.body.setGravityY(physicsConfig.gravity ?? this.CONFIG.PLAYER.gravity);
        body.body.setSize(bodyConfig.width, bodyConfig.height);

        const visual = this.add.image(x, surfaceY, data.texture ?? 'enemy')
            .setDisplaySize(visualConfig.width, visualConfig.height)
            .setOrigin(0.5, visualConfig.originY ?? 1)
            .setDepth(visualConfig.depth ?? 20);

        body.visual = visual;
        body.hp = data.stats?.hp ?? this.CONFIG.ENEMY.hp;
        body.maxHP = body.hp;
        body.stageIndex = stageIndex;
        body.spawnIndex = spawnIndex;
        body.spawnData = spawnData;
        body.enemyType = typeId;
        body.enemyData = data;
        body.facing = spawnData.facing ?? -1;
        body.lastDamageTime = 0;
        body.hitStunUntil = 0;
        body.isDying = false;
        body.hpBar = this.add.graphics().setDepth(25);

        body.patrolPlatform = null;
        if (typeId !== 'flying') {
            body.patrolPlatform = this.levelPlatforms.find(p =>
                !p.isGround && p.stageIndex === stageIndex &&
                Math.abs(p.surfaceY - surfaceY) < 3 &&
                x >= p.x - p.width / 2 && x <= p.x + p.width / 2
            ) || null;
            if (body.patrolPlatform) {
                body.patrolLeft = body.patrolPlatform.x - body.patrolPlatform.width / 2 + 24;
                body.patrolRight = body.patrolPlatform.x + body.patrolPlatform.width / 2 - 24;
            }
        }

        this.enemies.add(body);
        for (const p of this.levelPlatforms) this.physics.add.collider(body, p.collider);
        for (const p of this.movingPlatforms) this.physics.add.collider(body, p);
        return body;
    }

    createInput() {
        const K = Phaser.Input.Keyboard.KeyCodes;
        const controls = { ...CONTROLS, ...getControls() };

        this.keys = {
            left: this.input.keyboard.addKey(K[controls.left]),
            right: this.input.keyboard.addKey(K[controls.right]),
            up: this.input.keyboard.addKey(K[controls.up ?? 'UP']),
            down: this.input.keyboard.addKey(K[controls.down]),
            jump: this.input.keyboard.addKey(K[controls.jump]),
            attack: this.input.keyboard.addKey(K[controls.attack]),
            attackAlt: this.input.keyboard.addKey(K[controls.attackAlt ?? 'K']),
            cast: this.input.keyboard.addKey(K[controls.cast ?? 'CTRL']),
            flame: this.input.keyboard.addKey(K[controls.sigil1]),
            shadow: this.input.keyboard.addKey(K[controls.sigil2]),
            ether: this.input.keyboard.addKey(K[controls.sigil3]),
            gravis: this.input.keyboard.addKey(K[controls.sigil4]),
            water: this.input.keyboard.addKey(K[controls.sigil1]),
            light: this.input.keyboard.addKey(K[controls.sigil2]),
            time: this.input.keyboard.addKey(K[controls.sigil4]),
            clear: this.input.keyboard.addKey(K[controls.clear]),
            restart: this.input.keyboard.addKey(K[controls.restart]),
            pause: this.input.keyboard.addKey(K[controls.pause ?? 'ESC']),
            super: this.input.keyboard.addKey(K[controls.super ?? 'F'])
        };

        this.selectedSigils = [];
        this.rightCtrlDown = false;

        // Сигилы обрабатываются одним keydown-обработчиком. Это исключает
        // двойное добавление из-за одновременного keydown + JustDown.
        this._sigilKeyHandler = event => {
            if (event?.repeat || this.dialogueSystem?.active || this.isPaused || this.gameOver) return;
            // Универсальная раскладка: Z / X / C / V.
            // У Криака C — Эфир, поэтому он имеет полный набор из 4 сигилов.
            const map = {};
            const sigils = this.characterId === 'criac'
                ? ['water', 'light', 'ether', 'time']
                : ['flame', 'shadow', 'ether', 'gravis'];
            for (const sigil of sigils) {
                const controlName = this.characterData?.controls?.[sigil] ?? sigil;
                const configured = controls[controlName] ?? controls[sigil];
                if (configured) map[String(configured).toUpperCase()] = sigil;
            }
            const code = String(event?.code ?? '');
            const key = String(event?.key ?? '').toUpperCase();
            const sigil = map[key] ?? map[code.replace(/^Key/, '')] ?? map[code.replace(/^Digit/, '')];
            if (sigil) this.addSigilToSlot(sigil);
        };
        this.input.keyboard.on('keydown', this._sigilKeyHandler);

        // SHIFT всегда очищает текущий каст. Не зависит от controlConfig.
        this._clearSigilHandler = event => {
            if (event?.repeat || event?.key === 'Shift' || event?.code === 'ShiftLeft' || event?.code === 'ShiftRight') {
                this.clearSigilSlots();
                this.updateUI();
                this.updateCurrentCastText();
                event?.preventDefault?.();
            }
        };
        this.input.keyboard.on('keydown', this._clearSigilHandler);

        this._attackDownHandler = event => {
            if (event.repeat) return;
            if (event.keyCode === this.keys.attack.keyCode || event.keyCode === this.keys.attackAlt.keyCode) {
                this._attackStartedAt = this.time.now;
                this.playerAnimation.attackVisual = 'charge';
                this.combatSystem?.beginCharge(this.time.now);
            }
        };

        this._attackUpHandler = event => {
            if (event.keyCode === this.keys.attack.keyCode || event.keyCode === this.keys.attackAlt.keyCode) {
                const now = this.time.now;
                const wasCharging = this.combatSystem?.state === 'charging';
                const held = now - (this._attackStartedAt ?? now);
                this.combatSystem?.releaseAttack(now);
                // Обычная атака начинается после короткого idle-перехода,
                // чтобы спам атаки был визуально читаемым.
                if (wasCharging && held < 1000) {
                    this.playerAnimation.attackIdleGapUntil = now + 55;
                }
                this.playerAnimation.attackVisual = null;
            }
        };

        this._rightCtrlHandler = event => {
            if (!event.repeat && event.keyCode === this.keys.cast?.keyCode) {
                this.rightCtrlDown = true;
                this.castSelectedRecipe(this.time.now);
            }
        };

        this._rightCtrlUpHandler = event => {
            if (event.keyCode === this.keys.cast?.keyCode) this.rightCtrlDown = false;
        };

        this._enterHandler = event => {
            event?.preventDefault?.();

            if (this.dialogueSystem?.active) {
                this.dialogueSystem.advance();
                return;
            }

            // В паузе Enter подтверждает выбранный пункт.
            if (this.pauseSystem?.visible) {
                this.pauseSystem.activate(this.pauseSystem.index);
                return;
            }

            // В окне рецептов Enter закрывает его.
            if (this.recipePanelVisible) {
                this.toggleRecipePanel(false);
                return;
            }

            // После зачистки Enter подтверждает ПРОДОЛЖИТЬ.
            if (this.stageCompletePanel?.visible) {
                this.continueAfterStage();
                return;
            }

            if (this.gameOver) return;
            this.healWithGems();
        };

        this._pauseHandler = event => {
            if (event.keyCode !== this.keys.pause.keyCode || event.repeat) return;
            if (this.recipePanelVisible) {
                this.toggleRecipePanel(false);
                this.pauseSystem?.show();
                return;
            }
            this.pauseSystem?.toggle();
        };

        this._pauseMoveHandler = event => {
            if (this.stageCompletePanel?.visible) {
                if (event.code === 'ArrowLeft' || event.code === 'ArrowUp') this.moveStageCompleteSelection(-1);
                if (event.code === 'ArrowRight' || event.code === 'ArrowDown') this.moveStageCompleteSelection(1);
                return;
            }
            if (!this.pauseSystem?.visible) return;
            if (event.code === 'ArrowUp') this.pauseSystem.move(-1);
            if (event.code === 'ArrowDown') this.pauseSystem.move(1);
        };

        this.input.keyboard.on('keydown', this._attackDownHandler);
        this.input.keyboard.on('keyup', this._attackUpHandler);
        this.input.keyboard.on('keydown', this._rightCtrlHandler);
        this.input.keyboard.on('keyup', this._rightCtrlUpHandler);
        this.input.keyboard.on('keydown-ENTER', this._enterHandler);
        this.input.keyboard.on('keydown', this._pauseHandler);
        this.input.keyboard.on('keydown', this._pauseMoveHandler);
        this._cheatHandler = event => this.cheatSystem?.handleKey(event);
        this.input.keyboard.on('keydown', this._cheatHandler);
        this._restartHandler = event => {
            if (event.code !== 'KeyR' && event.key !== 'r' && event.key !== 'R' && event.keyCode !== Phaser.Input.Keyboard.KeyCodes.R) return;
            if (!this.gameOver || event.repeat) return;
            event.preventDefault?.();
            event.stopPropagation?.();
            this.restartGame();
        };
        this.input.keyboard.on('keydown', this._restartHandler);
        this._restartKeyHandler = event => {
            if (event?.repeat || !this.gameOver) return;
            event?.preventDefault?.();
            this.restartGame();
        };
        this.input.keyboard.on('keydown-R', this._restartKeyHandler);
    }

    update(time, delta) {
        if (!this.playerBody) return;

        this.backgroundSystem?.update();
        this.minimapSystem?.update(time);

        if (this.dialogueSystem?.active) {
            this.syncPlayerVisual();
            return;
        }

        if (this.gameOver) {
            this.syncPlayerVisual();
            return;
        }
        if (this.hitstopUntil > time) {
            this.syncPlayerVisual();
            return;
        }
        if (this.isPaused) {
            this.syncPlayerVisual();
            return;
        }

        if (this.timeStopUntil && time >= this.timeStopUntil) this.timeStopUntil = 0;
        this.updateMovingPlatforms();
        this.updatePlayer(time);
        if (Phaser.Input.Keyboard.JustDown(this.keys.super)) this.superSystem?.activate();
        this.combatSystem?.update(time);
        this.superSystem?.update(time);
        this.updatePlayerAnimation(delta);
        this.updateEnemies();
        ProjectileSystem.update(this, delta);
        this.updateRemnants();
        this.updateGems(delta);
        this.updateStageFlow();
        this.updateCurrentCastText();
        this.updateUI();
        this.syncPlayerVisual();

        // После игровой логики точки мини-карты получают актуальные позиции.
        this.minimapSystem?.update(time);
    }

    updatePlayer(time) {
        const body = this.playerBody.body;

        if (body.isDashing) {
            if (time < (body.dashUntil ?? 0)) {
                body.setVelocityX(body.dashVelocityX ?? 0);
                body.setVelocityY(0);
                return;
            }
            body.isDashing = false;
            body.isInvulnerable = false;
            body.dashVelocityX = 0;
        }

        let direction = 0;
        if (this.keys.left.isDown) direction -= 1;
        if (this.keys.right.isDown) direction += 1;

        const baseSpeed = this.player.stats.speed ?? this.CONFIG.PLAYER.speed;
        const speed = this.playerBody.form === 'super'
            ? baseSpeed * (this.CONFIG.SUPER?.speedMultiplier ?? 1)
            : baseSpeed;

        if (direction) {
            body.setVelocityX(direction * speed);
            this.playerBody.facing = direction;
        } else if (this.combatSystem?.state !== 'startup' && this.combatSystem?.state !== 'active') {
            body.setVelocityX(0);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.jump)) {
            if (body.blocked.down) {
                this.playerBody.jumpAnimation = 'normal';
                body.setVelocityY(-(this.player.stats.jumpVelocity ?? this.CONFIG.PLAYER.jumpVelocity));
            } else if (this.playerBody.canDoubleJump) {
                this.playerBody.jumpAnimation = 'ability';
                body.setVelocityY(-(this.player.stats.jumpVelocity ?? this.CONFIG.PLAYER.jumpVelocity));
                this.playerBody.canDoubleJump = false;
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.down)) this.dropToLowerPlatform();
    }

    updateStageFlow() {
        const body = this.playerBody.body;
        // В этой версии края настоящие: игрок не телепортируется, а упирается
        // в границы большой арены. Камера следует за ним по горизонтали.
        if (body.x < body.width / 2) { body.x = body.width / 2; body.setVelocityX(0); }
        if (body.x > this.worldWidth - body.width / 2) { body.x = this.worldWidth - body.width / 2; body.setVelocityX(0); }

        if (body.bottom > this.worldHeight + 120) {
            this.respawnPlayer();
        }
    }

    dropToLowerPlatform() {
        const body = this.playerBody.body;
        const currentBottom = body.bottom;
        const stage = this.stageStates[this.currentStageIndex];
        if (!stage) return;

        let best = null;
        for (const p of this.levelPlatforms) {
            if (p.stageIndex !== this.currentStageIndex) continue;
            if (p.surfaceY <= currentBottom + 8) continue;
            if (body.x < p.x - p.width / 2 + 12 || body.x > p.x + p.width / 2 - 12) continue;
            if (!best || p.surfaceY < best.surfaceY) best = p;
        }

        if (best) {
            body.reset(body.x, best.surfaceY - body.height / 2 - 2);
            body.setVelocity(0, 0);
            this.playerBody.canDoubleJump = false;
        }
    }

    findNearestLowerSurface(x, fromY) {
        let best = null;
        for (const p of this.levelPlatforms) {
            if (p.stageIndex !== this.currentStageIndex) continue;
            if (x < p.x - p.width / 2 + 12 || x > p.x + p.width / 2 - 12) continue;
            if (p.surfaceY <= fromY) continue;
            if (!best || p.surfaceY < best.y) best = { x, y: p.surfaceY };
        }
        return best || { x: this.stageCenter(this.currentStageIndex), y: this.getGroundY() };
    }

    transitionToStage(index) {
        if (index < 0 || index >= this.stageStates.length) return;

        this.currentStageIndex = index;
        this.stageLocked = false;
        this.backgroundSystem?.setStage(this.getBackgroundStageId(index));
        this.applyStageCameraBounds();
        this.updateStageUI();
    }

    applyStageCameraBounds() {
        const cam = this.cameras.main;
        cam.stopFollow();
        cam.setBounds(0, 0, this.worldWidth, this.worldHeight);
        cam.startFollow(this.playerBody, true, this.CONFIG.CAMERA.lerpX, 0);
        cam.setFollowOffset(-this.viewportWidth * 0.05, 0);
    }

    getStageIndexAtX(x) {
        return 0;
    }

    completeStage(index) {
        const stage = this.stageStates[index];
        if (!stage || stage.cleared) return;
        if (stage.targetKills > 0 && stage.kills < stage.targetKills) return;
        if (stage.targetKills === 0 && stage.enemiesRemaining > 0) return;

        stage.cleared = true;
        this.stageLocked = false;
        for (const timer of this.stageRespawnTimers.values()) timer?.remove?.(false);
        this.stageRespawnTimers.clear();
        this.eventBus.emit('objective:completed', { stageIndex: index, kills: stage.kills, target: stage.targetKills });
        this.updateStageUI();

        const hasNext = (this.selectedStageIndex ?? 0) < ((StageSystem.count?.() ?? 2) - 1);
        this.stageCompleteText?.setText(
            hasNext
                ? 'Цель выполнена. Следующая стадия готова.'
                : 'Все доступные стадии завершены.'
        );
        this.stageContinueText?.setText(hasNext ? 'ПРОДОЛЖИТЬ' : 'ЗАВЕРШИТЬ');
        this.stageCompletePanel?.setVisible(true);
        this.stageCompletePanel?.setDepth(500);
        this.isPaused = true;
        this.physics.world.pause();
        this.stageCompleteIndex = index;
        this.updateStageCompleteButtons(hasNext);
    }

    continueAfterStage() {
        const next = (this.selectedStageIndex ?? 0) + 1;
        const count = StageSystem.count?.() ?? 2;

        if (next < count) {
            this.stageCompletePanel?.setVisible(false);
            if (this.pendingBossDialogue) {
                this.playPendingBossDialogue(() => {
                    this.physics.world.resume();
                    this.isPaused = false;
                    this.scene.restart({ stageIndex: next, characterId: this.characterId });
                });
                return;
            }
            this.physics.world.resume();
            this.isPaused = false;
            this.scene.restart({ stageIndex: next, characterId: this.characterId });
            return;
        }

        this.openStageSelect();
    }

    openStageSelect() {
        this.physics.world.resume();
        this.isPaused = false;
        this.stageCompletePanel?.setVisible(false);
        this.scene.start('StageSelectScene', { characterId: this.characterId, mode: 'adventure' });
    }

    updateStageCompleteButtons(hasNext) {
        if (!this.stageContinueBg || !this.stageStageSelectBg || !this.stageMainMenuBg) return;

        this.stageContinueBg.setVisible(hasNext);
        this.stageContinueTextObject?.setVisible(hasNext);

        const y = hasNext ? 78 : 48;
        this.stageStageSelectBg.setPosition(-145, y + 62);
        this.stageStageSelectText?.setPosition(-145, y + 62);
        this.stageMainMenuBg.setPosition(145, y + 62);
        this.stageMainMenuText?.setPosition(145, y + 62);

        this.stageCompleteIndexSelected = hasNext ? 0 : 1;
        this.refreshStageCompleteFocus();
    }

    refreshStageCompleteFocus() {
        const hasNext = this.stageContinueBg?.visible;
        const items = hasNext
            ? [this.stageContinueBg, this.stageStageSelectBg, this.stageMainMenuBg]
            : [this.stageStageSelectBg, this.stageMainMenuBg];
        items.forEach((item, i) => item?.setStrokeStyle(3, i === this.stageCompleteIndexSelected ? 0xbfd5ff : 0x555577));
    }

    moveStageCompleteSelection(direction) {
        if (!this.stageCompletePanel?.visible) return;
        const count = this.stageContinueBg?.visible ? 3 : 2;
        this.stageCompleteIndexSelected = Phaser.Math.Wrap(this.stageCompleteIndexSelected + direction, 0, count);
        this.refreshStageCompleteFocus();
    }

    activateStageCompleteSelection() {
        if (!this.stageCompletePanel?.visible) return;
        const hasNext = this.stageContinueBg?.visible;
        if (hasNext && this.stageCompleteIndexSelected === 0) return this.continueAfterStage();
        if ((hasNext && this.stageCompleteIndexSelected === 1) || (!hasNext && this.stageCompleteIndexSelected === 0)) return this.openStageSelect();
        this.scene.start('MainMenuScene');
    }

    startBossIntroDialogue() {
        if (!this.dialogueSystem || this.selectedStageIndex !== 0) return;
        const heroName = this.characterData?.name ?? 'Ингор';
        this.dialogueSystem.start([
            { speaker: 'СТРАЖ', role: 'enemy', text: `${heroName}. Ты снова ступил на Предел пепла.` },
            { speaker: heroName, role: 'hero', text: 'Тогда не стой на моём пути.' },
            { speaker: 'СТРАЖ', role: 'enemy', text: 'Посмотрим, сколько ты продержишься.' }
        ]);
    }

    startBossThirdDefeatDialogue() {
        // Сначала показываем меню завершения миссии. Диалог третьего убийства
        // запускается после подтверждения ПРОДОЛЖИТЬ, чтобы последовательность
        // была: убийство → меню → продолжить → диалог → следующая стадия.
        this.pendingBossDialogue = true;
        this.completeStage(this.currentStageIndex);
    }

    playPendingBossDialogue(onComplete) {
        if (!this.pendingBossDialogue || !this.dialogueSystem) {
            onComplete?.();
            return;
        }
        this.pendingBossDialogue = false;
        this.dialogueSystem.start([
            { speaker: 'СТРАЖ', role: 'enemy', text: 'Трижды ты сломал мой предел.' },
            { speaker: this.characterData?.name ?? 'КРИАК', role: 'hero', text: 'Теперь дорога открыта.' },
            { speaker: 'СТРАЖ', role: 'enemy', text: 'Тогда иди дальше. Впереди Пустая дорога.' }
        ], { onComplete });
    }



    tryBasicAttack(time) {
        if (!this.combatSystem || this.combatSystem.state !== 'idle') return false;
        this.combatSystem.startAttack('normal', time);
        return true;
    }

    createSlashEffect(x, y, direction) {
        const g = this.add.graphics().setDepth(20);
        g.lineStyle(7, 0xffffff, 0.9);
        g.beginPath();
        g.arc(x, y, 64, direction > 0 ? Phaser.Math.DegToRad(210) : Phaser.Math.DegToRad(-30), direction > 0 ? Phaser.Math.DegToRad(330) : Phaser.Math.DegToRad(150), false);
        g.strokePath();
        g.closePath();
        this.tweens.add({ targets: g, alpha: 0, scaleX: 1.25, scaleY: 1.25, duration: 120, onComplete: () => g.destroy() });
    }

    hitEnemy(enemy, options = {}) {
        if (!enemy?.active || enemy.isDying) return;
        enemy.hp -= options.damage ?? 1;
        enemy.lastHitAt = this.time.now;
        this.flashEnemy(enemy);
        if ((options.damage ?? 1) >= 2) this.showDamageNumber(enemy.x, enemy.body?.center.y ?? enemy.y, options.damage ?? 1);
        if (enemy.body) {
            const knockbackX = options.knockbackX ?? 0;
            const knockbackY = options.knockbackY ?? 0;

            if (knockbackX !== 0 || knockbackY !== 0) {
                enemy.body.setVelocity(knockbackX, knockbackY);
            } else {
                enemy.body.setVelocity(0, 0);
            }

            enemy.hitStunUntil = this.time.now + (options.hitStun ?? this.CONFIG.ATTACK.hitStun);
        }
        if ((options.shake ?? 0) > 0) this.cameras.main.shake(90, (options.shake ?? 2) / 1000);
        this.hitstopUntil = Math.max(this.hitstopUntil, this.time.now + (options.hitstop ?? 0));
        if (enemy.hp <= 0) this.killEnemy(enemy);
        else this.updateEnemyHealthBar(enemy);
    }

    showDamageNumber(x, y, damage) {
        const text = this.add.text(x, y - 36, String(damage), {
            fontFamily: 'Arial', fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
            stroke: '#11111c', strokeThickness: 4
        }).setOrigin(0.5).setDepth(30);
        this.tweens.add({
            targets: text, y: y - 72, alpha: 0, duration: 420, ease: 'Cubic.Out',
            onComplete: () => text.destroy()
        });
    }

    flashEnemy(enemy) {
        if (!enemy?.visual?.active) return;
        enemy.visual.setTintFill(0xffffff);
        enemy.visual.setAlpha(1);
        this.time.delayedCall(65, () => {
            if (enemy.visual?.active) enemy.visual.clearTint();
        });
    }

    syncEnemyVisual(enemy) {
        if (!enemy || !enemy.active || !enemy.visual || !enemy.body) return;
        enemy.visual.x = enemy.x;
        enemy.visual.y = enemy.body.bottom;
        enemy.visual.setFlipX(enemy.facing < 0);
    }

    updateEnemies() {
        const now = this.time.now;
        if (this.timeStopUntil && now < this.timeStopUntil) {
            for (const enemy of this.enemies?.getChildren?.() ?? []) {
                if (enemy?.active) enemy.body?.setVelocity?.(0, 0);
            }
            return;
        }
        for (const enemy of this.enemies.getChildren()) {
            if (!enemy.active) continue;
            if (enemy.stageIndex !== this.currentStageIndex) {
                enemy.body.setVelocityX(0);
                this.syncEnemyVisual(enemy);
                continue;
            }
            if (this.playerBody.isInvisible) {
                enemy.body.setVelocityX(0);
                this.syncEnemyVisual(enemy);
                continue;
            }

            if (enemy.isLifted) {
                const now = this.time.now;

                if (now < (enemy.liftUntil ?? 0)) {
                    const riseStart = enemy.liftStartedAt ?? now;
                    const riseEnd = enemy.liftArriveAt ?? (riseStart + 420);
                    const t = Phaser.Math.Clamp(
                        (now - riseStart) / Math.max(1, riseEnd - riseStart),
                        0,
                        1
                    );

                    const targetCenterY = Phaser.Math.Linear(
                        enemy.liftStartY ?? enemy.body.center.y,
                        enemy.liftTargetY ?? enemy.body.center.y - 260,
                        t
                    );

                    // Не используем Body.reset() каждый кадр: reset сбрасывает
                    // collision state и на длинном подъёме враг может потерять
                    // нормальное взаимодействие с платформами.
                    const minCenterY = enemy.body.height / 2 + (this.CONFIG.MAGIC?.liftTopMargin ?? 70);
                    const maxCenterY = Math.max(minCenterY, this.worldHeight - enemy.body.height / 2 - (this.CONFIG.MAGIC?.liftBottomMargin ?? 70));
                    const safeCenterY = Phaser.Math.Clamp(targetCenterY, minCenterY, maxCenterY);

                    enemy.body.y = safeCenterY - enemy.body.height / 2;
                    enemy.body.prev.y = enemy.body.y;
                    enemy.y = safeCenterY;
                    enemy.body.setVelocity(0, 0);
                    enemy.body.setGravityY(0);

                    this.syncEnemyVisual(enemy);
                    this.updateEnemyHealthBar(enemy);
                    continue;
                }

                enemy.isLifted = false;
                enemy.liftStartedAt = 0;
                enemy.liftArriveAt = 0;
                enemy.liftUntil = 0;
                enemy.hitStunUntil = now;

                // Возвращаем именно исходную гравитацию конкретного врага.
                // Для flying она будет 0, для наземных — 1350.
                const half = enemy.body.height / 2;
                const minCenterY = half + (this.CONFIG.MAGIC?.liftTopMargin ?? 70);
                const maxCenterY = Math.max(minCenterY, this.worldHeight - half - (this.CONFIG.MAGIC?.liftBottomMargin ?? 70));
                const safeCenterY = Phaser.Math.Clamp(enemy.body.center.y, minCenterY, maxCenterY);
                enemy.body.y = safeCenterY - half;
                enemy.body.prev.y = enemy.body.y;
                enemy.y = safeCenterY;
                enemy.body.setGravityY(
                    enemy.normalGravityY ??
                    (enemy.enemyData?.physics?.gravity ?? (enemy.enemyType === 'flying' ? 0 : this.CONFIG.PLAYER.gravity))
                );
                enemy.body.setVelocityY(0);
            }

            if (this.time.now < (enemy.hitStunUntil ?? 0)) {
                enemy.body.setVelocity(0, 0);
                this.syncEnemyVisual(enemy);
                this.updateEnemyHealthBar(enemy);
                continue;
            }

            const data = enemy.enemyData ?? getEnemyData(enemy.enemyType);
            const stats = data.stats ?? {};
            const movement = data.movement ?? {};
            const dx = this.playerBody.x - enemy.x;
            const dy = this.playerBody.body.center.y - enemy.body.center.y;
            const distance = Math.hypot(dx, dy);
            const playerOnSameLevel = Math.abs(dy) < (enemy.enemyType === 'flying' ? 280 : 105);

            if (enemy.enemyType === 'flying') {
                if (distance <= (stats.aggroDistance ?? 1000)) {
                    const directionX = Math.sign(dx) || enemy.facing || 1;
                    const directionY = Math.sign(dy) || 0;
                    enemy.body.setVelocity(
                        directionX * (stats.speed ?? 120),
                        directionY * (stats.speed ?? 120) * 0.55
                    );
                    if (directionX) enemy.facing = directionX;
                } else {
                    enemy.body.setVelocity(
                        enemy.facing * (stats.speed ?? 120) * 0.35,
                        Math.sin(this.time.now / 500 + enemy.spawnIndex) * 35
                    );
                }
            } else if (distance <= (stats.aggroDistance ?? 800) && playerOnSameLevel) {
                let direction = Math.sign(dx) || enemy.facing || 1;
                if (enemy.patrolPlatform) {
                    if (enemy.x <= enemy.patrolLeft + 2 && direction < 0) direction = 0;
                    if (enemy.x >= enemy.patrolRight - 2 && direction > 0) direction = 0;
                }
                enemy.body.setVelocityX(direction * (stats.speed ?? this.CONFIG.ENEMY.speed));
                if (direction) enemy.facing = direction;
                if (Phaser.Geom.Intersects.RectangleToRectangle(this.playerBody.getBounds(), enemy.getBounds())) {
                    this.damagePlayer(stats.contactDamage ?? this.CONFIG.ENEMY.contactDamage);
                }
            } else if (enemy.patrolPlatform) {
                if (enemy.x <= enemy.patrolLeft) enemy.facing = 1;
                if (enemy.x >= enemy.patrolRight) enemy.facing = -1;
                enemy.body.setVelocityX(enemy.facing * (stats.speed ?? this.CONFIG.ENEMY.speed) * (movement.patrolSpeedMultiplier ?? 0.45));
            } else {
                const left = Math.max(40, enemy.spawnData?.patrolLeft ?? enemy.x - 230);
                const right = Math.min(this.worldWidth - 40, enemy.spawnData?.patrolRight ?? enemy.x + 230);
                if (enemy.patrolLeft == null) enemy.patrolLeft = left;
                if (enemy.patrolRight == null) enemy.patrolRight = right;
                if (enemy.x <= enemy.patrolLeft) enemy.facing = 1;
                if (enemy.x >= enemy.patrolRight) enemy.facing = -1;
                enemy.body.setVelocityX(enemy.facing * (stats.speed ?? this.CONFIG.ENEMY.speed) * (movement.patrolSpeedMultiplier ?? 0.42));
            }

            if (enemy.enemyType !== 'flying') {
                enemy.body.setVelocityY(Phaser.Math.Clamp(enemy.body.velocity.y, -900, 900));
                if (enemy.body.bottom > this.worldHeight - 2) {
                    enemy.body.y = this.worldHeight - enemy.body.height - 2;
                    enemy.body.setVelocityY(0);
                }
            }

            this.syncEnemyVisual(enemy);
            this.updateEnemyHealthBar(enemy);
        }
    }

    updateEnemyHealthBar(enemy) {
        if (!enemy?.hpBar?.active) return;
        const max = enemy.maxHP ?? this.CONFIG.ENEMY.hp;
        const ratio = Phaser.Math.Clamp(enemy.hp / max, 0, 1);
        const g = enemy.hpBar;
        g.clear();
        g.fillStyle(0x080812, 0.85);
        g.fillRect(enemy.x - 24, enemy.body.top - 13, 48, 5);
        g.fillStyle(ratio > 0.45 ? 0x8dff9f : 0xff7b7b, 1);
        g.fillRect(enemy.x - 23, enemy.body.top - 12, 46 * ratio, 3);
    }

    damagePlayer(amount) {
        const now = this.time.now;
        if (this.gameOver || this.playerBody.isSuperInvulnerable || now < this.playerBody.invulnerableUntil) return;
        this.playerHP = Math.max(0, this.playerHP - amount);
        this.playerBody.invulnerableUntil = now + 850;
        this.playerBody.body.setVelocityY(-280);
        this.playerBody.body.setVelocityX(this.playerBody.facing * -360);
        this.playerSprite.setTintFill(0xffffff);
        this.cameras.main.shake(130, 0.004);
        this.time.delayedCall(120, () => {
            if (this.playerSprite?.active) this.playerSprite.clearTint();
        });
        this.updateHPUI();
        if (this.playerHP <= 0) this.showGameOver();
    }

    healWithGems() {
        const cost = 5;
        const amount = 5;
        const maxHP = this.player?.stats?.maxHP ?? this.CONFIG.PLAYER.maxHP;
        if (this.playerHP >= maxHP) {
            this.showArenaMessage('HP ПОЛНОЕ');
            return false;
        }
        if ((this.gems ?? 0) < cost) {
            this.showArenaMessage('НУЖНО 5 ГЕМОВ');
            return false;
        }
        this.gems -= cost;
        this.playerHP = Math.min(maxHP, this.playerHP + amount);
        this.updateHPUI();
        this.updateUI();
        this.showArenaMessage('+5 HP');
        return true;
    }

    respawnPlayer() {
        const body = this.playerBody.body;
        const x = Phaser.Math.Clamp(this.playerBody.x, 180, this.worldWidth - 180);
        body.reset(x, this.getGroundY() - body.height / 2 - 2);
        body.setVelocity(0, 0);
        this.playerHP = this.player?.stats?.maxHP ?? this.CONFIG.PLAYER.maxHP;
        this.playerBody.invulnerableUntil = this.time.now + 1000;
        this.updateHPUI();
    }

    showGameOver() {
        this.gameOver = true;
        this.playerBody.body.setVelocity(0, 0);
        this.playerSprite.setTintFill(0x9999ff);
        this.gameOverPanel?.setVisible(true);
        this.cameras.main.shake(220, 0.008);
    }

    restartGame() {
        this.scene.restart({ stageIndex: this.selectedStageIndex, characterId: this.characterId });
    }

    killEnemy(enemy) {
        if (!enemy?.active || enemy.isDying) return;
        enemy.isDying = true;

        const stageIndex = enemy.stageIndex;
        const x = enemy.x;
        const y = enemy.body.center.y;
        const stage = this.stageStates[stageIndex];

        this.spawnRemnants(x, y, stageIndex);
        this.spawnGems(x, y, stageIndex, enemy);

        if (enemy.hpBar?.active) enemy.hpBar.destroy();
        if (enemy.visual?.active) {
            const burst = this.add.image(x, y, 'sigil_shadow')
                .setDisplaySize(enemy.enemyType === 'boss_roaming' ? 90 : 54, enemy.enemyType === 'boss_roaming' ? 90 : 54)
                .setAlpha(0.8)
                .setBlendMode(Phaser.BlendModes.ADD);
            this.tweens.add({ targets: burst, scale: 1.8, alpha: 0, angle: 180, duration: 260, onComplete: () => burst.destroy() });
            enemy.visual.destroy();
        }
        enemy.destroy();

        if (stage) {
            const wasBoss = enemy.enemyType === 'boss_roaming' || Boolean(enemy.enemyData?.boss);
            if (wasBoss) {
                this.bossDefeatCount += 1;
            }

            stage.enemiesRemaining = Math.max(0, stage.enemiesRemaining - 1);
            stage.kills += 1;
            this.killCount = stage.kills;

            this.superSystem?.add(enemy.enemyType === 'boss_roaming' ? 30 : 4);

            this.eventBus.emit('enemy:killed', {
                enemyType: enemy.enemyType,
                stageIndex,
                total: stage.kills,
                target: stage.targetKills
            });


            if (wasBoss && this.bossDefeatCount < 3) {
                // Босс нужен для теста третьего убийства: возвращаем его ещё два раза.
                const point = this.stageSpawnPoints[stageIndex]?.[enemy.spawnIndex] ?? enemy.spawnData;
                if (point) {
                    const delay = 900;
                    this.time.delayedCall(delay, () => {
                        if (!this.scene.isActive() || this.dialogueSystem?.active) return;
                        const surface = this.getSpawnSurface(point.x, point.row, stageIndex);
                        this.spawnEnemy(point.x, surface, stageIndex, enemy.spawnIndex, 'boss_roaming', point);
                        stage.enemiesRemaining += 1;
                    });
                }
            } else if (wasBoss && this.bossDefeatCount === 3) {
                this.startBossThirdDefeatDialogue();
            } else if (stage.targetKills > 0 && stage.kills >= stage.targetKills) {
                this.completeStage(stageIndex);
            } else if (stage.targetKills <= 0 && stage.enemiesRemaining <= 0 && !stage.respawnEnabled) {
                this.completeStage(stageIndex);
            } else if (stage.respawnEnabled) {
                const slot = enemy.spawnIndex;
                const used = stage.respawnsBySpawn[slot] ?? 0;
                if (used < stage.respawnLimit) {
                    stage.respawnsBySpawn[slot] = used + 1;
                    const point = this.stageSpawnPoints[stageIndex]?.[slot];
                    if (point) {
                        const delay = Phaser.Math.Between(650, 1250);
                        const timer = this.time.delayedCall(delay, () => {
                            this.stageRespawnTimers.delete(slot);
                            if (!this.scene.isActive() || stage.kills >= stage.targetKills) return;
                            const spawnPoint = this.stageSpawnPoints[stageIndex]?.[slot] ?? point;
                            const surface = this.getSpawnSurface(spawnPoint.x, spawnPoint.row, stageIndex);
                            this.spawnEnemy(spawnPoint.x, surface, stageIndex, slot, spawnPoint.type ?? 'grunt', spawnPoint);
                            stage.enemiesRemaining += 1;
                        });
                        this.stageRespawnTimers.set(slot, timer);
                    }
                }
            }
        }
    }

    spawnGems(sourceX, sourceY, stageIndex, enemy) {
        const loot = enemy?.enemyData?.loot?.gems ?? {};
        const min = Math.max(0, loot.min ?? 0);
        const max = Math.max(min, loot.max ?? min);
        const count = min === max ? min : Phaser.Math.Between(min, max);

        for (let i = 0; i < count; i++) {
            const angle = Phaser.Math.FloatBetween(-Math.PI, 0);
            const distance = Phaser.Math.Between(18, 72);
            const x = Phaser.Math.Clamp(
                sourceX + Math.cos(angle) * distance,
                this.stageStart(stageIndex) + 24,
                this.stageEnd(stageIndex) - 24
            );
            const y = Phaser.Math.Clamp(
                sourceY + Math.sin(angle) * distance * 0.45,
                24,
                this.worldHeight - 48
            );

            const gem = this.add.circle(x, y, 6, 0xffd27a, 1)
                .setStrokeStyle(2, 0xfff0b0, 0.9)
                .setDepth(18);

            gem.stageIndex = stageIndex;
            gem.value = 1;
            gem.velocityX = Phaser.Math.FloatBetween(-70, 70);
            gem.velocityY = Phaser.Math.FloatBetween(-260, -150);
            gem.spawnedAt = this.time.now;
            this.gemsWorld.push(gem);
        }
    }

    spawnRemnants(sourceX, sourceY, stageIndex) {
        for (let i = 0; i < this.CONFIG.LOOT.remnantsFromEnemy; i++) {
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const distance = Phaser.Math.Between(this.CONFIG.PICKUP.minSpawnDistanceFromSource, this.CONFIG.PICKUP.maxSpawnDistanceFromSource);
            const left = this.stageStart(stageIndex) + 30;
            const right = this.stageEnd(stageIndex) - 30;
            const x = Phaser.Math.Clamp(sourceX + Math.cos(angle) * distance, left, right);
            const y = Phaser.Math.Clamp(sourceY + Math.sin(angle) * distance * this.CONFIG.PICKUP.verticalSpread, 50, this.worldHeight - 70);
            const remnant = this.add.circle(x, y, 7, 0x66ccff, 0.9).setStrokeStyle(2, 0xbbeeff);
            remnant.stageIndex = stageIndex;
            this.remnants.push(remnant);
        }
    }

    updateRemnants() {
        for (let i = this.remnants.length - 1; i >= 0; i--) {
            const r = this.remnants[i];
            if (!r?.active) {
                this.remnants.splice(i, 1);
                continue;
            }
            r.setScale(1 + Math.sin(this.time.now / 180) * 0.08);
            if (r.stageIndex === this.currentStageIndex && Phaser.Math.Distance.Between(this.playerBody.x, this.playerBody.body.center.y, r.x, r.y) <= this.CONFIG.PICKUP.autoCollectRadius) {
                this.playerBody.canDoubleJump = true;
                this.playerBody.canDash = true;
                r.destroy();
                this.remnants.splice(i, 1);
            }
        }
    }

    updateGems(delta) {
        const dt = Math.min(32, delta) / 1000;
        const playerX = this.playerBody.x;
        const playerY = this.playerBody.body.center.y;

        for (let i = this.gemsWorld.length - 1; i >= 0; i--) {
            const gem = this.gemsWorld[i];
            if (!gem?.active) {
                this.gemsWorld.splice(i, 1);
                continue;
            }

            gem.velocityY += 900 * dt;
            gem.x += gem.velocityX * dt;
            gem.y += gem.velocityY * dt;
            gem.velocityX *= 0.985;

            const surface = this.groundY(gem.x);
            if (gem.y >= surface - 8 && gem.velocityY > 0) {
                gem.y = surface - 8;
                gem.velocityY = -Math.abs(gem.velocityY) * 0.22;
            }

            gem.setScale(1 + Math.sin(this.time.now / 130 + i) * 0.10);

            if (
                gem.stageIndex === this.currentStageIndex &&
                Phaser.Math.Distance.Between(playerX, playerY, gem.x, gem.y) <= (this.CONFIG.PICKUP.autoCollectRadius ?? 75)
            ) {
                this.gems += gem.value ?? 1;
                gem.destroy();
                this.gemsWorld.splice(i, 1);
                this.updateUI();
            }
        }
    }

    getAvailableSigils() {
        if (this.recipeSystem?.getAvailableSigils) return this.recipeSystem.getAvailableSigils();
        if (this.characterId === 'criac') return ['water','light','ether','time'];
        return this.characterData?.sigils?.initial ?? ['flame','shadow','ether','gravis'];
    }

    getCurrentRecipe() {
        if (this.recipeSystem) {
            const recipe = this.recipeSystem.find(
                this.selectedSigils,
                this.getAvailableSigils()
            );

            if (recipe) {
                return {
                    ...recipe,
                    cast: recipe.ability ?? null
                };
            }
        }

        return {
            name: this.selectedSigils.length ? 'Нестабильная магия' : 'Добавьте сигилы',
            mode: 'invalid',
            cast: null,
            ability: null
        };
    }

    updateSelectedSigils() {}

    addSigilToSlot(name) {
        const available = this.getAvailableSigils();
        if (!available.includes(name)) return false;

        if (this.selectedSigils.length >= 3) this.selectedSigils.shift();
        this.selectedSigils.push(name);
        this.updateUI();
        this.updateCurrentCastText();

        // Автокаст разрешён ТОЛЬКО для двух одинаковых сигилов.
        // Смешанные двойные и все тройные комбинации сначала собираются,
        // а затем запускаются отдельным RIGHT CTRL.
        if (this.selectedSigils.length === 2) {
            const [a, b] = this.selectedSigils;
            if (a === b) {
                const recipe = this.getCurrentRecipe();
                if (recipe?.cast && recipe.mode === 'auto') {
                    this.castSelectedRecipe(this.time.now, true);
                }
            }
        }
        return true;
    }

    clearSigilSlots() {
        this.selectedSigils.length = 0;
        this.updateCurrentCastText();
        this.updateUI();
    }

    castSelectedRecipe(time, auto = false) {
        const recipe = this.getCurrentRecipe();

        if (!recipe.cast) return false;

        if (recipe.mode === 'cast' && !auto && !this.rightCtrlDown) {
            return false;
        }

        const ability = ABILITIES[recipe.cast];
        if (!ability) return false;

        // Криак: Z+Z использует отдельный cast_1. Все остальные заклинательные
        // способности используют cast_2. Рывки и прыжки вообще не переключают
        // cast-анимацию — их собственная механика/обычная анимация остаётся видимой.
        const criacCast1 = this.characterId === 'criac' && recipe.cast === 'waterBurst';
        const movementAbility = ['lightDash', 'waterLightDash', 'timeJump'].includes(recipe.cast);
        if (this.characterId === 'criac') {
            if (!movementAbility) {
                // cast_1 = Z+Z (waterBurst). Все остальные обычные касты = cast_2.
                // Кадр держится целиком, чтобы Phaser не переключал его сам.
                this.playerAnimation.overrideType = 'cast';
                this.playerAnimation.overrideUntil = this.time.now + 360;
                this.playerAnimation.frame = criacCast1 ? 1 : 2;
                this.playerAnimation.timer = 0;
                this.playerAnimation.frameDelay = 999999;
                this.playerAnimation.state = 'cast';
                this.setPlayerAnimationFrame('cast', criacCast1 ? 1 : 2);
            }
        } else {
            this.setPlayerVisualOverride('cast', 300, 999999);
        }
        const result = ability(this, this.playerBody);
        if (result === false) {
            this.updateUI();
            return false;
        }

        this.lastCastText = recipe.name;
        this.showMagicEffect(recipe.cast);
        this.clearSigilSlots();
        this.updateUI();
        return true;
    }

    showMagicEffect(castName) {
        const map = {
            fire: 'sigil_flame', shadowDash: 'sigil_shadow', energyExplosion: 'sigil_ether',
            highJump: 'sigil_gravis', fireDash: 'sigil_flame', fireExplosion: 'sigil_flame',
            fireJump: 'sigil_flame', invisibility: 'sigil_shadow', teleportUp: 'sigil_ether',
            fireAura: 'sigil_flame', liftEnemies: 'sigil_gravis', waterProjectile: 'sigil_water', waterBurst: 'sigil_water', lightBurst: 'sigil_light', lightDash: 'sigil_light', waterLightDash: 'sigil_water', timeStop: 'sigil_time', timePulse: 'sigil_time', timeJump: 'sigil_time', timeWave: 'sigil_time'
        };
        const texture = map[castName] || 'sigil_flame';
        const effect = this.add.image(this.playerBody.x, this.playerBody.body.center.y, texture)
            .setDisplaySize(34, 34)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setAlpha(0.95)
            .setScale(0.45);
        this.tweens.add({ targets: effect, scaleX: 2.2, scaleY: 2.2, alpha: 0, angle: 180, duration: 420, onComplete: () => effect.destroy() });
    }

    castFire() {
        const direction = this.playerBody.facing || 1;
        const speed = this.CONFIG.PROJECTILE.baseSpeed ?? 700;
        const projectile = this.physics.add.image(
            this.playerBody.x + direction * 42,
            this.playerBody.body.center.y,
            'fireball'
        );
        projectile.setDisplaySize(this.CONFIG.PROJECTILE.size ?? 22, this.CONFIG.PROJECTILE.size ?? 22);
        projectile.damage = this.CONFIG.PROJECTILE.baseDamage ?? 20;
        projectile.projectileVelocityX = direction * speed;
        projectile.body.setAllowGravity(false);
        projectile.body.setDrag(0, 0);
        projectile.body.setMaxVelocity(speed, 0);
        projectile.body.setVelocity(projectile.projectileVelocityX, 0);
        projectile.setActive(true).setVisible(true);
        this.projectiles.add(projectile);
        // После добавления в группу ещё раз задаём скорость: Phaser Group не должен
        // сбрасывать движение снаряда. updateProjectiles также поддерживает её каждый кадр.
        projectile.body.setVelocity(projectile.projectileVelocityX, 0);
        this.time.delayedCall(this.CONFIG.PROJECTILE.lifetime ?? 1800, () => {
            if (projectile.active) projectile.destroy();
        });
        return projectile;
    }

    castEnergyExplosion() {
        const x = this.playerBody.x;
        const y = this.playerBody.body.center.y;
        const radius = 170;
        const damage = 100;

        for (const enemy of this.enemies.getChildren()) {
            if (!enemy.active || enemy.stageIndex !== this.currentStageIndex) continue;
            if (Phaser.Math.Distance.Between(x, y, enemy.x, enemy.body.center.y) <= radius) {
                this.hitEnemy(enemy, {
                    damage,
                    knockbackX: 0,
                    knockbackY: 0,
                    hitStun: 240,
                    hitstop: 55,
                    shake: 5
                });
            }
        }

        const core = this.add.circle(x, y, 24, 0x9fe8ff, 0.75)
            .setStrokeStyle(4, 0xffffff, 0.8)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDepth(25);
        const ring = this.add.circle(x, y, 38, 0x78d7ff, 0.0)
            .setStrokeStyle(6, 0xbceeff, 0.8)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDepth(24);
        this.tweens.add({
            targets: [core, ring],
            scaleX: radius / 24,
            scaleY: radius / 24,
            alpha: 0,
            duration: 360,
            ease: 'Cubic.Out',
            onComplete: () => { core.destroy(); ring.destroy(); }
        });
        this.cameras.main.shake(120, 0.005);
    }

    castHighJump() {
        this.playerBody.jumpAnimation = 'ability';
        this.playerBody.body.setVelocityY(-this.CONFIG.MAGIC.jumpVelocity);
        this.playerBody.canDoubleJump = true;
    }
    castFireExplosion() {
        this.createExplosion(this.playerBody.x, this.playerBody.body.center.y, 170, 1, 'sigil_flame');
    }

    castFireJump() {
        this.playerBody.jumpAnimation = 'ability';
        this.playerBody.body.setVelocityY(-this.CONFIG.MAGIC.jumpVelocity);
        this.playerBody.canDoubleJump = true;
        this.createExplosion(
            this.playerBody.x,
            this.playerBody.body.center.y,
            90,
            1,
            'sigil_flame'
        );
    }

    castInvisibility() {
        this.playerBody.isInvisible = true;
        this.playerSprite.setAlpha(0.18);
        if (this._invisibilityTimer) this._invisibilityTimer.remove(false);
        this._invisibilityTimer = this.time.delayedCall(1800, () => {
            if (!this.playerBody?.active) return;
            this.playerBody.isInvisible = false;
            this.playerSprite.setAlpha(1);
            this._invisibilityTimer = null;
        });
    }

    castTeleportUp() {
        const body = this.playerBody.body;
        body.reset(body.x, Phaser.Math.Clamp(body.y - 280, body.height / 2, this.worldHeight - body.height / 2));
        body.setVelocity(0, 0);
    }

    castFireAura() {
        const duration = 1800;
        const tick = 300;
        const radius = 125;
        const aura = this.add.circle(this.playerBody.x, this.playerBody.body.center.y, 34, 0xffa13a, 0.18)
            .setStrokeStyle(3, 0xffd27a, 0.8)
            .setBlendMode(Phaser.BlendModes.ADD);
        const timer = this.time.addEvent({
            delay: tick,
            repeat: Math.floor(duration / tick) - 1,
            callback: () => {
                if (!this.playerBody?.active) return;
                aura.x = this.playerBody.x;
                aura.y = this.playerBody.body.center.y;
                for (const enemy of this.enemies.getChildren()) {
                    if (!enemy.active || enemy.stageIndex !== this.currentStageIndex) continue;
                    if (Phaser.Math.Distance.Between(aura.x, aura.y, enemy.x, enemy.body.center.y) <= radius) {
                        this.hitEnemy(enemy, { damage: 1, knockbackX: 0, knockbackY: 0, hitStun: 180, shake: 1 });
                    }
                }
            }
        });
        this.time.delayedCall(duration, () => {
            timer.remove(false);
            if (aura.active) aura.destroy();
        });
    }

    performLiftEnemies() {
        // Не делегируем обратно в ABILITIES.liftEnemies: это раньше
        // образовывало рекурсию MainScene -> abilities -> MainScene.
        const body = this.playerBody?.body;
        if (!this.playerBody?.active || !body) return false;

        const x = this.playerBody.x;
        const y = body.center.y;
        const radius = 300;
        const now = this.time.now;
        let affected = 0;

        for (const enemy of this.enemies?.getChildren?.() ?? []) {
            if (!enemy?.active || enemy.stageIndex !== this.currentStageIndex || !enemy.body) continue;
            if (Phaser.Math.Distance.Between(x, y, enemy.x, enemy.body.center.y) > radius) continue;

            enemy.isLifted = true;
            enemy.liftStartedAt = now;
            enemy.liftArriveAt = now + 700;
            enemy.liftUntil = now + Math.max(2600, this.CONFIG.MAGIC?.levitateTime ?? 3000);
            enemy.liftStartY = enemy.body.center.y;
            enemy.liftTargetY = Phaser.Math.Clamp(enemy.body.center.y - 250, enemy.body.height / 2 + 20, this.worldHeight - enemy.body.height / 2 - 20);
            enemy.normalGravityY = enemy.normalGravityY ?? enemy.body.gravity.y;
            enemy.hitStunUntil = enemy.liftUntil;
            enemy.body.setGravityY(0);
            enemy.body.setVelocity(0, 0);
            affected++;
        }
        return affected > 0;
    }

    castLiftEnemies() { return this.performLiftEnemies(); }

    castShadowDash() {
        this.startPlayerDash(this.CONFIG.DASH.shadowSpeed, this.CONFIG.DASH.shadowDuration);
    }

    castFireDash() {
        this.startPlayerDash(this.CONFIG.DASH.fireSpeed, this.CONFIG.DASH.fireDuration);
    }

    startPlayerDash(speed, duration) {
        const body = this.playerBody?.body;
        if (!body) return;

        const direction = this.playerBody.facing || 1;
        const dashSpeed = Phaser.Math.Clamp(Number(speed) || 1200, 900, 1600);
        const dashDuration = Phaser.Math.Clamp(Number(duration) || 900, 700, 1100);
        body.isDashing = true;
        body.dashUntil = this.time.now + dashDuration;
        body.dashVelocityX = direction * dashSpeed;
        body.isInvulnerable = true;
        body.setVelocity(body.dashVelocityX, 0);
    }

    createExplosion(x, y, radius, damage, textureKey) {
        const fx = this.add.image(x, y, textureKey).setDisplaySize(50, 50).setAlpha(0.75).setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({ targets: fx, scale: radius / 25, alpha: 0, angle: 220, duration: 320, onComplete: () => fx.destroy() });
        for (const enemy of this.enemies.getChildren()) {
            if (!enemy.active || enemy.stageIndex !== this.currentStageIndex) continue;
            if (Phaser.Math.Distance.Between(x, y, enemy.x, enemy.body.center.y) < radius) {
                this.hitEnemy(enemy, { damage, knockbackX: 0, knockbackY: 0, hitStun: 180, hitstop: 28, shake: 2 });
            }
        }
    }

    createUI() {
        this.ui = this.add.container(0, 0).setScrollFactor(0).setDepth(100);

        // Верхняя панель: здоровье отдельно от подсказок и статуса арены.
        const hpPanel = this.add.rectangle(18, 18, 330, 92, 0x090b16, 0.92)
            .setOrigin(0).setStrokeStyle(2, 0x565d7d, 0.9);
        const hpTitle = this.add.text(36, 29, 'АВРОН', {
            fontFamily: 'Arial', fontSize: '14px', color: '#aeb7d9', fontStyle: 'bold'
        });
        this.hpText = this.add.text(36, 48, '', {
            fontFamily: 'Arial', fontSize: '24px', color: '#ffb0b0', fontStyle: 'bold'
        });
        this.hpBarBg = this.add.rectangle(36, 83, 294, 10, 0x1d2030).setOrigin(0.5);
        this.hpBarFill = this.add.rectangle(36, 83, 294, 10, 0xe36f7a).setOrigin(0, 0.5);
        this.ui.add([hpPanel, hpTitle, this.hpText, this.hpBarBg, this.hpBarFill]);

        this.echoPanel = this.textures.exists('ui_echo_frame')
            ? this.add.image(this.scale.width - 18, 18, 'ui_echo_frame')
                .setDisplaySize(350, 112)
                .setOrigin(1, 0)
                .setAlpha(0.78)
            : this.add.rectangle(this.scale.width - 18, 18, 350, 112, 0x090b16, 0.84)
                .setOrigin(1, 0)
                .setStrokeStyle(2, 0x697292, 0.9);
        const statusPanel = this.add.rectangle(this.scale.width - 36, 28, 314, 86, 0x090b16, 0.18)
            .setOrigin(1, 0);
        this.stageText = this.add.text(this.scale.width - 36, 28, '', {
            fontFamily: 'Arial', fontSize: '18px', color: '#ffffff', fontStyle: 'bold', stroke: '#080812', strokeThickness: 5
        }).setOrigin(1, 0);
        this.castText = this.add.text(this.scale.width - 36, 53, 'Последний каст: —', {
            fontFamily: 'Arial', fontSize: '14px', color: '#b9c3e8', fontStyle: 'bold', stroke: '#080812', strokeThickness: 4
        }).setOrigin(1, 0);
        this.currentCastText = this.add.text(this.scale.width - 36, 76, 'Слоты пусты', {
            fontFamily: 'Arial', fontSize: '13px', color: '#8edcff', fontStyle: 'bold', stroke: '#080812', strokeThickness: 4
        }).setOrigin(1, 0);
        this.gemsText = this.add.text(this.scale.width - 36, 98, 'ГЕМЫ 0', {
            fontFamily: 'Arial', fontSize: '13px', color: '#ffd27a', fontStyle: 'bold', stroke: '#080812', strokeThickness: 4
        }).setOrigin(1, 0);
        this.ui.add([this.echoPanel, statusPanel, this.stageText, this.castText, this.currentCastText, this.gemsText]);

        this.minimapPanel = this.textures.exists('ui_echo_frame')
            ? this.add.image(this.scale.width - 18, 140, 'ui_echo_frame')
                .setDisplaySize(286, 122)
                .setOrigin(1, 0)
                .setAlpha(0.62)
            : this.add.rectangle(this.scale.width - 18, 140, 286, 122, 0x090b16, 0.82)
                .setOrigin(1, 0)
                .setStrokeStyle(2, 0x697292, 0.8);
        this.ui.add(this.minimapPanel);
        this.layoutHUDPanels();

        // Нижняя панель — только управление сигилами.
        this.toolbar = this.add.container(this.scale.width / 2, this.scale.height - 58).setScrollFactor(0);
        const barBg = this.add.rectangle(0, 0, 290, 74, 0x090b16, 0.94)
            .setStrokeStyle(2, 0x565d7d, 0.95);
        this.toolbar.add(barBg);
        this.toolbarSlots = [];
        for (let i = 0; i < 3; i++) {
            const x = (i - 1) * 72;
            const slot = this.add.rectangle(x, 0, 54, 54, 0x111526, 1).setStrokeStyle(2, 0x666d91);
            const icon = this.add.image(x, 0, 'sigil_flame').setDisplaySize(36, 36).setVisible(false);
            this.toolbar.add([slot, icon]);
            this.toolbarSlots.push({ slot, icon });
        }
        this.ui.add(this.toolbar);

        // Permanent four-sigil HUD: shows the character's available sigils and highlights
        // the currently selected ones, just like the Tutorial HUD.
        this.sigilTokenHud = [];
        const tokenPanel = this.add.container(24, 132).setScrollFactor(0).setDepth(1000);
        const tokenBg = this.add.rectangle(0, 0, 270, 76, 0x090b16, 0.82).setOrigin(0, 0).setStrokeStyle(2, 0x565d7d, 0.85);
        tokenPanel.add(tokenBg);
        const map = { flame:'sigil_flame', shadow:'sigil_shadow', ether:'sigil_ether', gravis:'sigil_gravis', water:'sigil_water', light:'sigil_light', time:'sigil_time' };
        const sigils = this.getAvailableSigils();
        const controls = [this.controls?.sigil1 ?? 'Z', this.controls?.sigil2 ?? 'X', this.controls?.sigil3 ?? 'C', this.controls?.sigil4 ?? 'V'];
        sigils.forEach((sigil, i) => {
            const x = 34 + i * 58;
            const slot = this.add.rectangle(x, 38, 48, 48, 0x000000, 0.25).setStrokeStyle(2, 0xffffff, 0.2);
            const icon = this.add.image(x, 38, map[sigil]).setDisplaySize(36, 36).setAlpha(0.65);
            const key = this.add.text(x, 8, controls[i] ?? '?', {fontFamily:'Arial', fontSize:'12px', color:'#ffffff'}).setOrigin(0.5);
            tokenPanel.add([slot, icon, key]);
            this.sigilTokenHud.push({sigil, slot, icon});
        });
        this.ui.add(tokenPanel);

        const help = this.add.text(18, this.scale.height - 18,
            '← → движение   ↑ вверх   SPACE прыжок   J/DELETE атака   F супер   Z/X/C/V сигилы   SHIFT очистить   CTRL каст   ENTER лечение   ESC пауза',
            { fontFamily: 'Arial', fontSize: '12px', color: '#8f96b5', backgroundColor: '#090b16dd', padding: { x: 8, y: 6 } }
        ).setOrigin(0, 1);
        this.ui.add(help);

        this.gameOverPanel = this.add.container(this.scale.width / 2, this.scale.height / 2).setVisible(false).setDepth(110);
        const overBg = this.add.rectangle(0, 0, 560, 220, 0x080812, 0.96).setStrokeStyle(2, 0x7777aa);
        const overTitle = this.add.text(0, -55, 'АВРОН ПАЛ', { fontFamily: 'Arial', fontSize: '36px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        const overHint = this.add.text(0, 15, 'R — начать заново', { fontFamily: 'Arial', fontSize: '22px', color: '#aaddff' }).setOrigin(0.5);
        this.gameOverPanel.add([overBg, overTitle, overHint]);
        this.ui.add(this.gameOverPanel);

        this.arenaMessage = this.add.text(this.scale.width / 2, this.scale.height * 0.22, '', {
            fontFamily: 'Arial', fontSize: '30px', color: '#ffffff', fontStyle: 'bold', stroke: '#080812', strokeThickness: 8
        }).setOrigin(0.5).setAlpha(0);
        this.ui.add(this.arenaMessage);

        this.stageCompletePanel = this.add.container(this.scale.width / 2, this.scale.height / 2)
            .setScrollFactor(0)
            .setDepth(115)
            .setVisible(false);
        const completeBg = this.add.rectangle(0, 0, 680, 300, 0x080812, 0.97).setStrokeStyle(2, 0x8dff9f);
        const completeTitle = this.add.text(0, -85, 'СТАДИЯ ЗАЧИЩЕНА', { fontFamily: 'Arial', fontSize: '34px', color: '#9cffb0', fontStyle: 'bold' }).setOrigin(0.5);
        const completeText = this.add.text(0, -25, '', { fontFamily: 'Arial', fontSize: '18px', color: '#ffffff', align: 'center' }).setOrigin(0.5);
        const continueBg = this.add.rectangle(0, 70, 270, 55, 0x24243a, 1).setStrokeStyle(2, 0x9ba2c2).setInteractive({ useHandCursor: true });
        const continueText = this.add.text(0, 70, 'ПРОДОЛЖИТЬ', { fontFamily: 'Arial', fontSize: '19px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        const stageSelectBg = this.add.rectangle(-145, 135, 250, 42, 0x111526, 1).setStrokeStyle(2, 0x555577).setInteractive({ useHandCursor: true });
        const stageSelectText = this.add.text(-145, 135, 'ВЫБОР СТАДИИ', { fontFamily: 'Arial', fontSize: '15px', color: '#b9c3e8' }).setOrigin(0.5);
        const mainMenuBg = this.add.rectangle(145, 135, 250, 42, 0x111526, 1).setStrokeStyle(2, 0x555577).setInteractive({ useHandCursor: true });
        const mainMenuText = this.add.text(145, 135, 'ГЛАВНОЕ МЕНЮ', { fontFamily: 'Arial', fontSize: '15px', color: '#b9c3e8' }).setOrigin(0.5);
        continueBg.on('pointerdown', () => this.continueAfterStage());
        continueText.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.continueAfterStage());
        stageSelectBg.on('pointerdown', () => this.scene.start('StageSelectScene', { characterId: this.characterId, mode: 'adventure' }));
        stageSelectText.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.start('StageSelectScene', { characterId: this.characterId, mode: 'adventure' }));
        mainMenuBg.on('pointerdown', () => this.scene.start('MainMenuScene'));
        mainMenuText.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.start('MainMenuScene'));
        this.stageCompletePanel.add([completeBg, completeTitle, completeText, continueBg, continueText, stageSelectBg, stageSelectText, mainMenuBg, mainMenuText]);
        this.stageCompleteText = completeText;
        this.stageContinueText = continueText;
        this.stageContinueBg = continueBg;
        this.stageContinueTextObject = continueText;
        this.stageStageSelectBg = stageSelectBg;
        this.stageStageSelectText = stageSelectText;
        this.stageMainMenuBg = mainMenuBg;
        this.stageMainMenuText = mainMenuText;
        this.stageCompleteIndexSelected = 0;
        this.ui.add(this.stageCompletePanel);
        this.refreshStageCompleteFocus();
    }

    updateStageUI() {
        if (!this.stageText || !this.stageStates) return;
        const s = this.stageStates[this.currentStageIndex] ?? this.stageStates[0];
        const name = this.activeStageData?.name ?? `Стадия ${Number(this.selectedStageIndex ?? 0) + 1}`;
        if (s?.targetKills > 0) {
            this.stageText.setText(`${name}   ${s.kills} / ${s.targetKills}`);
        } else {
            this.stageText.setText(s?.cleared ? `${name} — ЗАЧИЩЕНА` : name);
        }
        this.stageText.setColor(s?.cleared ? '#9cffb0' : '#ffffff');
    }

    updateHPUI() {
        if (!this.hpText) return;
        const maxHP = this.player?.stats?.maxHP ?? this.CONFIG.PLAYER.maxHP;
        const ratio = Phaser.Math.Clamp(this.playerHP / maxHP, 0, 1);
        this.hpText.setText(`HP  ${this.playerHP} / ${maxHP}`);
        this.hpText.setColor(this.playerHP <= 30 ? '#ff7777' : '#ffb0b0');
        if (this.hpBarFill) {
            this.hpBarFill.width = 294 * ratio;
            this.hpBarFill.setFillStyle(this.playerHP <= 30 ? 0xff626f : 0xe36f7a);
        }
    }

    showArenaMessage(text) {
        if (!this.arenaMessage) return;
        this.arenaMessage.setText(text).setAlpha(0).setScale(0.8);
        this.tweens.add({ targets: this.arenaMessage, alpha: 1, scale: 1, duration: 220, yoyo: true, hold: 1000, onComplete: () => this.arenaMessage.setAlpha(0) });
    }

    updateCurrentCastText() {
        if (!this.currentCastText) return;
        const recipe = this.getCurrentRecipe();
        this.currentCastText.setText(!this.selectedSigils.length ? 'Слоты пусты' : (recipe.mode === 'cast' ? 'RIGHT CTRL → ' : '→ ') + recipe.name);
    }

    updateUI() {
        if (this.isCleaningUp || !this.toolbarSlots || !this.sys?.isActive?.()) return;
        const map = { flame: 'sigil_flame', shadow: 'sigil_shadow', ether: 'sigil_ether', gravis: 'sigil_gravis', water: 'sigil_water', light: 'sigil_light', time: 'sigil_time' };
        for (let i = 0; i < 3; i++) {
            const item = this.toolbarSlots[i];
            const name = this.selectedSigils[i];
            const textureKey = name ? map[name] : null;
            const textureAvailable = textureKey && this.textures?.exists?.(textureKey);
            item.icon.setVisible(Boolean(textureAvailable));
            if (textureAvailable) item.icon.setTexture(textureKey).setDisplaySize(36, 36);
            item.slot.setStrokeStyle(2, name ? 0xbbaaff : 0x666688);
        }
        if (this.castText?.active) this.castText.setText('Последний каст: ' + (this.lastCastText || '—'));
        if (this.gemsText?.active) this.gemsText.setText(`ГЕМЫ ${this.gems ?? 0}   SUPER ${Math.round(this.superSystem?.meter ?? 0)}%`);
        const selectedSigils = this.selectedSigils ?? [];
        for (const item of (this.sigilTokenHud ?? [])) {
            const active = selectedSigils.includes(item.sigil);
            item.icon.setAlpha(active ? 1 : 0.65);
            item.slot.setStrokeStyle(2, active ? 0xffd86b : 0xffffff, active ? 0.95 : 0.2);
            item.slot.setFillStyle(active ? 0x3a2b12 : 0x000000, active ? 0.55 : 0.25);
        }
    }

    layoutHUDPanels() {
        const right = this.scale.width - 18;
        this.echoPanel?.setPosition(right, 18);
        this.minimapPanel?.setPosition(right, 140);
        const minimapWidth = this.CONFIG.MINIMAP?.width ?? 250;
        const minimapHeight = this.CONFIG.MINIMAP?.height ?? 96;
        const mapX = right - 18 - minimapWidth;
        const mapY = 153;
        this.minimapSystem?.setPosition?.(mapX, mapY);
    }

    createRecipePanel() {
        this.recipePage = 0;
        this.recipePageSize = 5;
        this.recipePanel = this.add.container(this.scale.width / 2, this.scale.height / 2).setScrollFactor(0).setVisible(false).setDepth(130);
        this.recipePanel.add(this.add.rectangle(0, 0, 940, 620, 0x08080f, 0.98).setStrokeStyle(2, 0x7777aa));
        this.recipePanel.add(this.add.text(0, -282, 'ПАУЗА / РЕЦЕПТЫ', { fontFamily:'Arial', fontSize:'28px', color:'#ffffff', fontStyle:'bold' }).setOrigin(0.5));
        this.recipePanelHint = this.add.text(0, -248, '', { fontFamily:'Arial', fontSize:'14px', color:'#9ea5c8' }).setOrigin(0.5);
        this.recipePanel.add(this.recipePanelHint);
        this.recipeContent = this.add.container(0, -20);
        this.recipePanel.add(this.recipeContent);
        this.recipePrevButton = this.add.text(-350, 275, '‹  НАЗАД', { fontFamily:'Arial', fontSize:'18px', color:'#cfd5ff', backgroundColor:'#17172a', padding:{left:14,right:14,top:8,bottom:8} }).setOrigin(0.5).setInteractive({useHandCursor:true});
        this.recipeNextButton = this.add.text(350, 275, 'ВПЕРЁД  ›', { fontFamily:'Arial', fontSize:'18px', color:'#cfd5ff', backgroundColor:'#17172a', padding:{left:14,right:14,top:8,bottom:8} }).setOrigin(0.5).setInteractive({useHandCursor:true});
        this.recipePageText = this.add.text(0, 275, '', { fontFamily:'Arial', fontSize:'16px', color:'#ffffff' }).setOrigin(0.5);
        this.recipePanel.add([this.recipePrevButton, this.recipePageText, this.recipeNextButton]);
        this.recipePanel.add(this.add.text(0, 307, 'ENTER — закрыть рецепты   •   SHIFT — очистить сигилы', { fontFamily:'Arial', fontSize:'14px', color:'#8f96b5' }).setOrigin(0.5));
        this.recipePrevButton.on('pointerdown', () => this.changeRecipePage(-1));
        this.recipeNextButton.on('pointerdown', () => this.changeRecipePage(1));
        this._recipeWheelHandler = (_pointer, _over, _dx, dy) => {
            if (!this.recipePanelVisible) return;
            if (dy > 0) this.changeRecipePage(1); else if (dy < 0) this.changeRecipePage(-1);
        };
        this.input.on('wheel', this._recipeWheelHandler);
        this._recipePageKeyHandler = event => {
            if (!this.recipePanelVisible || event?.repeat) return;
            if (event.code === 'ArrowLeft' || event.code === 'PageUp') this.changeRecipePage(-1);
            if (event.code === 'ArrowRight' || event.code === 'PageDown') this.changeRecipePage(1);
        };
        this.input.keyboard.on('keydown', this._recipePageKeyHandler);
        this.updateRecipePanel();
    }

    changeRecipePage(delta) {
        const rows = this.recipeSystem?.getAll?.() ?? [];
        const maxPage = Math.max(0, Math.ceil(rows.length / this.recipePageSize) - 1);
        this.recipePage = Phaser.Math.Clamp((this.recipePage ?? 0) + delta, 0, maxPage);
        this.updateRecipePanel();
    }

    updateRecipePanel() {
        if (!this.recipeContent) return;
        this.recipeContent.removeAll(true);
        const rows = this.recipeSystem?.getAll?.() ?? [];
        const available = new Set(this.getAvailableSigils());
        const sigilLabel = { flame:'Z Пламя', shadow:'X Тень', ether:'C Эфир', gravis:'V Гравис', water:'Z Вода', light:'X Свет', time:'V Время' };
        const totalPages = Math.max(1, Math.ceil(rows.length / this.recipePageSize));
        this.recipePage = Phaser.Math.Clamp(this.recipePage ?? 0, 0, totalPages - 1);
        const pageRows = rows.slice(this.recipePage * this.recipePageSize, (this.recipePage + 1) * this.recipePageSize);
        this.recipePanelHint?.setText(`${this.characterData?.name ?? (this.characterId === 'criac' ? 'Криак' : 'Ингор')}  •  Сигилы: ${[...available].map(s => sigilLabel[s] ?? s).join('  |  ')}`);
        pageRows.forEach((recipe, index) => {
            const col = index % 2, row = Math.floor(index / 2);
            const x = col === 0 ? -225 : 225, y = row * 88 - 210;
            const keyText = recipe.key.split('+').map(s => sigilLabel[s] ?? s).join('  +  ');
            const modeText = recipe.mode === 'auto' ? 'АВТО' : 'RIGHT CTRL';
            const card = this.add.rectangle(x, y, 410, 76, 0x111221, 0.96).setStrokeStyle(1, recipe.mode === 'auto' ? 0x6e8cff : 0x9b7cff, 0.7);
            const title = this.add.text(x - 188, y - 25, recipe.name, { fontFamily:'Arial', fontSize:'16px', color:'#ffffff', fontStyle:'bold', wordWrap:{width:375} }).setOrigin(0,0);
            const key = this.add.text(x - 188, y + 3, keyText, { fontFamily:'Arial', fontSize:'13px', color:'#bfc6ea', wordWrap:{width:375} }).setOrigin(0,0);
            const mode = this.add.text(x - 188, y + 26, modeText, { fontFamily:'Arial', fontSize:'11px', color:recipe.mode === 'auto' ? '#9cffb0' : '#d4b8ff' }).setOrigin(0,0);
            this.recipeContent.add([card, title, key, mode]);
        });
        this.recipePageText?.setText(`${this.recipePage + 1} / ${totalPages}`);
        this.recipePrevButton?.setAlpha(this.recipePage > 0 ? 1 : 0.35);
        this.recipeNextButton?.setAlpha(this.recipePage < totalPages - 1 ? 1 : 0.35);
    }

    toggleRecipePanel(force = null) {
        const visible = force === null
            ? !this.recipePanelVisible
            : Boolean(force);

        this.recipePanelVisible = visible;
        this.recipePanel?.setVisible(visible);

        if (visible) {
            this.pauseSystem?.hide();
            this.isPaused = true;
            this.physics.world.pause();
        } else if (!this.pauseSystem?.visible) {
            this.isPaused = false;
            this.physics.world.resume();
        }
    }

    // Универсальный helper для ассетов: код сам задаёт нужный размер PNG.
    // Исходное разрешение картинки может быть любым.
    addAsset(key, x, y, width, height, depth = 0, originX = 0.5, originY = 0.5) {
        return this.add.image(x, y, key)
            .setDisplaySize(width, height)
            .setOrigin(originX, originY)
            .setDepth(depth);
    }

    setupCamera() {
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.startFollow(
            this.playerBody,
            true,
            this.CONFIG.CAMERA.lerpX,
            this.CONFIG.CAMERA.lerpY ?? this.CONFIG.CAMERA.lerpX
        );
        this.cameras.main.setFollowOffset(-this.viewportWidth * 0.05, 0);
        this.cameras.main.centerOn(this.playerBody.x, this.worldHeight / 2);
    }

    handleResize(gameSize) {
        if (!this.scene.isActive()) return;

        this.viewportWidth = Math.max(640, Math.floor(gameSize.width));
        this.viewportHeight = Math.max(360, Math.floor(gameSize.height));

        // Высота физического мира не равна высоте окна.
        this.worldHeight = this.selectedStageIndex === 1 ? 600 : (this.CONFIG.WORLD.height ?? 1200);
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

        this.backgroundSystem?.resize();
        this.layoutHUDPanels();

        if (this.toolbar) this.toolbar.setPosition(this.scale.width / 2, this.scale.height - 58);
        if (this.recipePanel) this.recipePanel.setPosition(this.scale.width / 2, this.scale.height / 2);
        this.pauseSystem?.resize();
        if (this.gameOverPanel) this.gameOverPanel.setPosition(this.scale.width / 2, this.scale.height / 2);
        if (this.stageCompletePanel) this.stageCompletePanel.setPosition(this.scale.width / 2, this.scale.height / 2);
        if (this.arenaMessage) this.arenaMessage.setPosition(this.scale.width / 2, this.scale.height * 0.22);

        this.applyStageCameraBounds();
    }

    cleanup() {
        if (this._sigilKeyHandler) { this.input?.keyboard?.off?.('keydown', this._sigilKeyHandler); this._sigilKeyHandler = null; }
        if (this._clearSigilHandler) { this.input?.keyboard?.off?.('keydown', this._clearSigilHandler); this._clearSigilHandler = null; }
        this.isCleaningUp = true;
        this.scale.off('resize', this.handleResize, this);
        if (this._recipeWheelHandler) { this.input.off('wheel', this._recipeWheelHandler); this._recipeWheelHandler = null; }
        if (this._recipePageKeyHandler) { this.input.keyboard.off('keydown', this._recipePageKeyHandler); this._recipePageKeyHandler = null; }
        if (this._attackDownHandler) this.input.keyboard.off('keydown', this._attackDownHandler);
        if (this._attackUpHandler) this.input.keyboard.off('keyup', this._attackUpHandler);
        if (this._rightCtrlHandler) this.input.keyboard.off('keydown', this._rightCtrlHandler);
        if (this._rightCtrlUpHandler) this.input.keyboard.off('keyup', this._rightCtrlUpHandler);
        if (this._enterHandler) this.input.keyboard.off('keydown-ENTER', this._enterHandler);
        if (this._pauseHandler) this.input.keyboard.off('keydown', this._pauseHandler);
        if (this._pauseMoveHandler) this.input.keyboard.off('keydown', this._pauseMoveHandler);
        if (this._cheatHandler) this.input.keyboard.off('keydown', this._cheatHandler);
        if (this._restartHandler) this.input.keyboard.off('keydown', this._restartHandler);
        if (this._restartKeyHandler) this.input.keyboard.off('keydown-R', this._restartKeyHandler);
        for (const [eventName, handler] of this._sigilHandlers ?? []) this.input.keyboard.off(eventName, handler);
        this._sigilHandlers = [];
        if (this.stageTransitionTimer) this.stageTransitionTimer.remove(false);
        if (this._invisibilityTimer) this._invisibilityTimer.remove(false);
        for (const timer of this.stageRespawnTimers?.values?.() ?? []) timer?.remove?.(false);
        this.stageRespawnTimers?.clear?.();
        this.eventBusOffKill?.();
        this.eventBusOffKill = null;
        this.eventBus?.clear?.();

        for (const gem of this.gemsWorld ?? []) gem?.destroy?.();
        this.gemsWorld = [];
        this.combatSystem?.destroy();
        this.superSystem?.destroy();
        this.pauseSystem?.destroy();
        this.dialogueSystem?.destroy();
        this.minimapSystem?.destroy();
        this.backgroundSystem?.destroy();
        this.minimapSystem = null;
        this.backgroundSystem = null;
    }
}

