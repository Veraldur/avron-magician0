import {
    GAME_CONFIG
} from '../../config/gameConfig.js';

import {
    Player
} from '../entities/Player.js';

import {
    InputManager
} from '../system/InputManager.js';

import {
    RecipeSystem
} from '../system/RecipeSystem.js';

import {
    AbilitySystem
} from '../system/AbilitySystem.js';
import { CombatSystem } from '../system/CombatSystem.js';
import { PlayerController } from '../system/PlayerController.js';
import { ProjectileSystem } from '../system/ProjectileSystem.js';
import { getControls } from '../system/SaveSystem.js';
import { createTutorialObjectives } from '../data/tutorial/tutorialObjectives.js';

import {
    EventBus
} from '../core/EventBus.js';

import {
    TutorialSystem
} from '../system/TutorialSystem.js';


export default class TutorialScene
    extends Phaser.Scene {

    constructor() {

        super({
            key: 'TutorialScene'
        });

        this.CONFIG =
            GAME_CONFIG;

        this.rightCtrl = null;
        this.platforms = null;
        this.enemy = null;
        this.enemyHPBar = null;
    }


    init(data) {

        this.characterId =
            data?.characterId ??
            this.registry.get(
                'selectedCharacterId'
            ) ??
            this.registry.get(
                'characterId'
            ) ??
            'ingor';


        this.registry.set(
            'selectedCharacterId',
            this.characterId
        );

        this.registry.set(
            'characterId',
            this.characterId
        );

        this.controls = { ...getControls() };
    }


    preload() {

        // ---------------------------------------------------------
        // PLAYER
        // ---------------------------------------------------------

        const playerFrames = [
            ['ingor_idle_1', 'assets/player/Ingor/ingor_idle_1.png'],
            ['ingor_idle_2', 'assets/player/Ingor/ingor_idle_2.png'],
            ['ingor_walk_1', 'assets/player/Ingor/ingor_walk_1.png'],
            ['ingor_walk_2', 'assets/player/Ingor/ingor_walk_2.png'],
            ['ingor_jump_1', 'assets/player/Ingor/ingor_jump_1.png'],
            ['ingor_jump_2', 'assets/player/Ingor/ingor_jump_2.png'],
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
        for (const [key, path] of playerFrames) this.load.image(key, path);


        // ---------------------------------------------------------
        // ENEMY / PROJECTILE
        // ---------------------------------------------------------

        this.load.image(
            'enemy',
            'assets/enemy.png'
        );

        this.load.image(
            'fireball',
            'assets/fireball.png'
        );


        // ---------------------------------------------------------
        // SIGILS
        // ---------------------------------------------------------

        this.load.image(
            'sigil_flame',
            'assets/sigils/flame.png'
        );

        this.load.image(
            'sigil_shadow',
            'assets/sigils/shadow.png'
        );

        this.load.image(
            'sigil_ether',
            'assets/sigils/ether.png'
        );

        this.load.image(
            'sigil_gravis',
            'assets/sigils/gravis.png'
        );

        this.load.image(
            'sigil_water',
            'assets/sigils/water.png'
        );

        this.load.image(
            'sigil_light',
            'assets/sigils/light.png'
        );

        this.load.image(
            'sigil_time',
            'assets/sigils/time.png'
        );
    }


    create() {

        // ---------------------------------------------------------
        // WORLD
        // ---------------------------------------------------------

        this.worldWidth = 1500;

        this.worldHeight =
            Math.max(
                720,
                this.scale.height
            );


        this.physics.world.setBounds(
            0,
            0,
            this.worldWidth,
            this.worldHeight
        );


        this.cameras.main.setBounds(
            0,
            0,
            this.worldWidth,
            this.worldHeight
        );


        this.cameras.main.setBackgroundColor(
            '#080812'
        );


        // ---------------------------------------------------------
        // EVENT BUS
        // ---------------------------------------------------------

        this.eventBus =
            new EventBus();


        // ---------------------------------------------------------
        // TUTORIAL SYSTEM
        // ---------------------------------------------------------

        // Система рецептов — единственный источник доступных способностей
        // для этого персонажа. Обучение строится из неё же.
        this.recipeSystem = new RecipeSystem(this.characterId);
        this.tutorialSystem = new TutorialSystem(
            this,
            this.eventBus,
            createTutorialObjectives(this.recipeSystem, this.controls)
        );


        // ---------------------------------------------------------
        // LEVEL
        // ---------------------------------------------------------

        this.createPlatforms();


        // ---------------------------------------------------------
        // PLAYER
        //
        // surfaceY — верх поверхности земли.
        // Player сам ставит body по этой координате.
        // ---------------------------------------------------------

        this.player =
            new Player(
                this,
                {
                    characterId:
                        this.characterId,

                    x: 260,

                    surfaceY:
                        this.groundY
                }
            );


        this.playerBody =
            this.player.body;
        this.playerBody.body?.setCollideWorldBounds?.(true);

        this.playerSprite =
            this.player.sprite;


        // ---------------------------------------------------------
        // PLAYER / PLATFORM COLLISION
        // ---------------------------------------------------------

        this.physics.add.collider(
            this.playerBody,
            this.platforms
        );


        // AbilitySystem в некоторых способностях
        // использует scene.player.
        this.player =
            this.player;


        // ---------------------------------------------------------
        // INPUT
        // ---------------------------------------------------------

        this.inputManager =
            new InputManager(
                this,
                this.player
            );

        this.keys = this.inputManager.keys;
        this.combatSystem = new CombatSystem(this);
        this.playerController = new PlayerController(this, this.player);
        this.bindCombatInput();
        this.bindAbilityInput();



        // ---------------------------------------------------------
        // RIGHT CTRL
        //
        // Создаём ОДИН раз.
        // Не создавать клавишу внутри update().
        // ---------------------------------------------------------

        this.rightCtrl = this.keys.cast;


        // ---------------------------------------------------------
        // PROJECTILES
        // ---------------------------------------------------------

        this.projectiles = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.currentStageIndex = 0;
        this.isPaused = false;
        this.gameOver = false;

        // ---------------------------------------------------------
        // ENEMY
        // ---------------------------------------------------------

        this.createTutorialEnemy();


        // ---------------------------------------------------------
        // ENEMY / PLATFORM COLLISION
        // ---------------------------------------------------------

        this.physics.add.collider(
            this.enemy,
            this.platforms
        );


        // ---------------------------------------------------------
        // CAMERA
        // ---------------------------------------------------------

        this.cameras.main.startFollow(
            this.playerBody,
            true,
            0.12,
            0
        );


        // ---------------------------------------------------------
        // UI
        // ---------------------------------------------------------

        this.createTutorialUI();

        this.bindTutorialEvents();

        this.updateTutorialUI();
    }


    // =============================================================
    // LEVEL
    // =============================================================

    createPlatforms() {

        this.groundY =
            this.worldHeight - 90;


        this.platforms =
            this.physics.add.staticGroup();

        // Tutorial arena walls: the player can never dash out of the training room.
        this.createPlatform(10, this.worldHeight / 2, 20, this.worldHeight, 0x151526);
        this.createPlatform(this.worldWidth - 10, this.worldHeight / 2, 20, this.worldHeight, 0x151526);


        // ---------------------------------------------------------
        // MAIN GROUND
        // ---------------------------------------------------------

        this.createPlatform(
            this.worldWidth / 2,
            this.groundY + 25,
            this.worldWidth,
            50,
            0x202038
        );


        // ---------------------------------------------------------
        // UPPER PLATFORM 1
        // ---------------------------------------------------------

        this.createPlatform(
            620,
            this.groundY - 170,
            250,
            22,
            0x343452
        );


        // ---------------------------------------------------------
        // UPPER PLATFORM 2
        // ---------------------------------------------------------

        this.createPlatform(
            1050,
            this.groundY - 300,
            250,
            22,
            0x343452
        );
    }


    createPlatform(
        x,
        y,
        width,
        height,
        color = 0x343452
    ) {

        const platform =
            this.add.rectangle(
                x,
                y,
                width,
                height,
                color
            );


        platform.setStrokeStyle(
            2,
            0x686890
        );


        this.physics.add.existing(
            platform,
            true
        );


        this.platforms.add(
            platform
        );


        return platform;
    }


    // =============================================================
    // ENEMY
    // =============================================================

    createTutorialEnemy() {

        // Игрок стартует примерно на x=260.
        // Враг стоит на x=350.
        //
        // Расстояние значительно меньше
        // ATTACK.range = 125.
        //
        // Поэтому DELETE сразу может попасть.

        const x = 355;

        const y =
            this.groundY -
            32;


        this.enemy =
            this.physics.add.image(
                x,
                y,
                'enemy'
            );


        this.enemy.setDisplaySize(
            64,
            64
        );


        this.enemy.body.setSize(
            48,
            58
        );


        this.enemy.body.setAllowGravity(
            true
        );


        this.enemy.body.setGravityY(
            this.CONFIG.PLAYER.gravity
        );


        this.enemy.body.setCollideWorldBounds(
            true
        );


        this.enemy.hp = 1000;
        this.enemy.maxHP = 1000;

        this.enemy.isDying =
            false;

        this.enemy.lastHit = 0;
        this.enemy.stageIndex = 0;
        this.enemies.add(this.enemy);

        this.enemyHPBar =
            this.add.graphics()
                .setDepth(30);


        this.updateEnemyHP();
    }


    updateEnemyHP() {

        if (
            !this.enemy?.active ||
            !this.enemyHPBar
        ) {
            return;
        }


        const ratio =
            Phaser.Math.Clamp(
                this.enemy.hp /
                this.enemy.maxHP,
                0,
                1
            );


        const x =
            this.enemy.x - 30;

        const y =
            this.enemy.body.top - 14;


        this.enemyHPBar.clear();


        this.enemyHPBar.fillStyle(
            0x080812,
            0.9
        );


        this.enemyHPBar.fillRect(
            x,
            y,
            60,
            7
        );


        this.enemyHPBar.fillStyle(
            ratio > 0.5
                ? 0x8dff9f
                : 0xff7b7b,
            1
        );


        this.enemyHPBar.fillRect(
            x + 1,
            y + 1,
            58 * ratio,
            5
        );
    }


    // =============================================================
    // PLAYER INPUT
    // =============================================================

    updatePlayer(time, delta) {
        this.playerController?.update(time, delta);
    }

    bindCombatInput() {
        this._attackDownHandler = event => {
            if (event?.repeat) return;
            const attackKey = this.keys?.attack;
            const isAttack = event?.keyCode === attackKey?.keyCode;
            if (!isAttack) return;
            this.combatSystem?.beginCharge(this.time.now);
        };

        this._attackUpHandler = event => {
            const attackKey = this.keys?.attack;
            if (event?.keyCode !== attackKey?.keyCode) return;
            this.combatSystem?.releaseAttack(this.time.now);
        };

        this.input.keyboard.on('keydown', this._attackDownHandler);
        this.input.keyboard.on('keyup', this._attackUpHandler);
    }

    bindAbilityInput() {
        this.input.keyboard.on('keydown', event => {
            if (event?.repeat) return;
            for (const [sigil, key] of Object.entries(this.inputManager.sigilKeys)) {
                if (event?.keyCode === key?.keyCode) {
                    this.player.selectSigil(sigil);
                    this.eventBus.emit('tutorial:sigil', { sigil });
                    this.handleSigilSelection();
                    return;
                }
            }
            if (event?.keyCode === this.rightCtrl?.keyCode) this.castSelectedRecipe();
        });
    }

    // Общий боевой адаптер: CombatSystem и ProjectileSystem работают с
    // тем же контрактом, что и MainScene.
    hitEnemy(enemy, options = {}) {
        if (!enemy?.active || enemy.isDying) return;

        this.damageTutorialEnemy(options.damage ?? 1, options);

        if (this.combatSystem?.state !== 'idle') {
            this.eventBus.emit('tutorial:attack');
        }
    }

    damageTutorialEnemy(amount = 1, options = {}) {
        const enemy = this.enemy;
        if (!enemy?.active) return;

        enemy.hp = Math.max(1, Number(enemy.hp ?? enemy.maxHP ?? 1000) - Math.max(0, amount));
        enemy.lastHit = this.time.now;

        if (enemy.body) {
            if (options.knockbackX) enemy.body.setVelocityX(options.knockbackX);
            // Тренировочный манекен не должен улетать/подниматься за экран.
            enemy.body.setVelocityY(0);
        }

        this.updateEnemyHP();
    }

    // =============================================================
    // SIGILS
    // =============================================================

    handleSigilSelection() {

        const selected =
            this.player.selectedSigils;


        // ---------------------------------------------------------
        // AUTO RECIPES
        //
        // ZZ
        // XX
        // CC
        // VV
        // ---------------------------------------------------------

        if (selected.length === 2 && selected[0] === selected[1]) {
            const recipe = this.recipeSystem.find(selected, this.player.sigils);
            if (recipe?.ability && recipe.mode === 'auto') this.castRecipe(recipe);
        }
    }


    castSelectedRecipe() {

        const selected =
            this.player.selectedSigils;


        if (
            !selected.length
        ) {
            return;
        }


        const recipe =
            this.recipeSystem.find(
                selected,
                this.player.sigils
            );


        if (
            !recipe?.ability
        ) {
            return;
        }


        if (
            recipe.mode !== 'cast'
        ) {
            return;
        }


        this.castRecipe(
            recipe
        );
    }


    castRecipe(
        recipe
    ) {

        const success =
            AbilitySystem.cast(
                this,
                this.player,
                recipe
            );


        if (!success) {
            return;
        }


        this.showMagicEffect(
            recipe.ability
        );


        this.eventBus.emit(
            `tutorial:${recipe.ability}`
        );


        this.player.clearSelectedSigils();
    }


    performLiftEnemies() {
        const enemy = this.enemy;
        if (!enemy?.active) return false;
        if (!enemy.body) return false;
        // В Tutorial показываем эффект подъёма, но манекен остаётся на площадке.
        enemy.body.setVelocity(0, 0);
        enemy.body.setGravityY(this.CONFIG.PLAYER.gravity);
        this.tweens.add({ targets: enemy, y: enemy.y - 18, duration: 160, yoyo: true });
        return true;
    }

    startPlayerDash(speed, duration) {
        const body = this.playerBody?.body;
        if (!body) return;
        const direction = this.playerBody.facing || 1;
        body.isDashing = true;
        // Tutorial использует те же параметры рывка, что и Adventure.
        const dashSpeed = Phaser.Math.Clamp(Number(speed) || 1200, 900, 1600);
        const dashDuration = Phaser.Math.Clamp(Number(duration) || 900, 700, 1100);
        body.dashUntil = this.time.now + dashDuration;
        body.dashVelocityX = direction * dashSpeed;
        body.isInvulnerable = true;
        body.setVelocity(body.dashVelocityX, 0);
    }

    showMagicEffect(
        ability
    ) {

        const map = {

            fire:
                'sigil_flame',

            shadowDash:
                'sigil_shadow',

            energyExplosion:
                'sigil_ether',

            highJump:
                'sigil_gravis',

            fireDash:
                'sigil_flame',

            fireExplosion:
                'sigil_flame',

            fireJump:
                'sigil_flame',

            invisibility:
                'sigil_shadow',

            teleportUp:
                'sigil_ether',
            fireAura:
                'sigil_flame',
            liftEnemies:
                'sigil_gravis',
            waterProjectile:
                'sigil_water',
            waterBurst:
                'sigil_water',
            lightBurst:
                'sigil_light',
            lightDash:
                'sigil_light',
            waterLightDash:
                'sigil_water',
            timeStop:
                'sigil_time',
            timePulse:
                'sigil_time',
            timeJump:
                'sigil_time',
            timeWave:
                'sigil_time'
        };


        const texture =
            map[ability];


        if (
            !texture ||
            !this.textures.exists(
                texture
            )
        ) {
            return;
        }


        const effect =
            this.add.image(
                this.playerBody.x,
                this.playerBody.body.center.y,
                texture
            );


        effect
            .setDisplaySize(
                38,
                38
            )
            .setBlendMode(
                Phaser.BlendModes.ADD
            )
            .setDepth(50);


        this.tweens.add({

            targets: effect,

            scale: 2.2,

            alpha: 0,

            duration: 260,

            onComplete: () => {

                if (effect.active) {
                    effect.destroy();
                }
            }
        });
    }


    // =============================================================
    // UI
    // =============================================================

    createTutorialUI() {

        this.tutorialTitle =
            this.add.text(
                28,
                24,
                'ОБУЧЕНИЕ',
                {
                    fontFamily: 'Arial',
                    fontSize: '28px',
                    fontStyle: 'bold',
                    color: '#ffffff'
                }
            )
            .setScrollFactor(0)
            .setDepth(1000);


        this.tutorialText =
            this.add.text(
                28,
                68,
                '',
                {
                    fontFamily: 'Arial',
                    fontSize: '20px',
                    color: '#d8d8ff',
                    lineSpacing: 8
                }
            )
            .setScrollFactor(0)
            .setDepth(1000);


        this.objectiveText =
            this.add.text(
                this.scale.width - 28,
                28,
                '',
                {
                    fontFamily: 'Arial',
                    fontSize: '18px',
                    color: '#ffffff',
                    align: 'right'
                }
            )
            .setOrigin(1, 0)
            .setScrollFactor(0)
            .setDepth(1000);


        this.controlsText =
            this.add.text(
                28,
                this.scale.height - 38,
                `← → движение    ${this.controls.jump} прыжок    ${this.controls.attack} атака    ${this.controls.sigil1}/${this.controls.sigil2}/${this.controls.sigil3}/${this.controls.sigil4} сигилы    ${this.controls.cast} каст    ESC выйти`,
                {
                    fontFamily: 'Arial',
                    fontSize: '15px',
                    color: '#9999bb'
                }
            )
            .setScrollFactor(0)
            .setDepth(1000);

        this.sigilHud = [];
        const availableSigils = this.player?.getSigils?.() ?? [];
        availableSigils.forEach((sigil, index) => {
            const x = 32 + index * 58;
            const keyName = [this.controls.sigil1, this.controls.sigil2, this.controls.sigil3, this.controls.sigil4][index] ?? '?';
            const icon = this.add.image(x, this.scale.height - 86, `sigil_${sigil}`)
                .setDisplaySize(38, 38).setScrollFactor(0).setDepth(1000).setAlpha(0.65);
            const key = this.add.text(x, this.scale.height - 112, keyName, { fontFamily:'Arial', fontSize:'13px', color:'#ffffff' })
                .setOrigin(0.5).setScrollFactor(0).setDepth(1001);
            const slot = this.add.rectangle(x, this.scale.height - 86, 46, 46, 0x000000, 0.25)
                .setStrokeStyle(2, 0xffffff, 0.2).setScrollFactor(0).setDepth(999);
            this.sigilHud.push({ sigil, icon, key, slot });
        });

        this.exitButton = this.add.text(
            this.scale.width - 28,
            this.scale.height - 38,
            'ВЫЙТИ [ESC]',
            { fontFamily: 'Arial', fontSize: '15px', color: '#9999bb' }
        ).setOrigin(1, 0.5).setScrollFactor(0).setDepth(1000).setInteractive({ useHandCursor: true });
        this.exitButton.on('pointerdown', () => this.exitTutorial());
        this._tutorialEscHandler = () => this.exitTutorial();
        this.input.keyboard.on('keydown-ESC', this._tutorialEscHandler);
    }


    bindTutorialEvents() {

        this.eventBus.on(
            'tutorial:objectiveChanged',
            () => {
                this.updateTutorialUI();
            }
        );


        this.eventBus.on(
            'tutorial:progress',
            () => {
                this.updateTutorialUI();
            }
        );


        this.eventBus.on(
            'tutorial:objectiveComplete',
            () => {
                this.updateTutorialUI();
            }
        );


        this.eventBus.on(
            'tutorial:complete',
            () => {

                this.tutorialText.setText(
                    'Обучение завершено.\n\nПереход в приключение...'
                );


                this.time.delayedCall(
                    1200,
                    () => {

                        this.scene.start(
                            'MainScene',
                            {
                                characterId:
                                    this.characterId
                            }
                        );
                    }
                );
            }
        );
    }


    updateTutorialUI() {

        const objective =
            this.tutorialSystem?.current;


        if (
            !objective
        ) {

            this.objectiveText.setText(
                'ГОТОВО'
            );

            return;
        }


        this.objectiveText.setText(
            `${objective.title}\n` +
            `${objective.progress}/${objective.required}`
        );


        this.tutorialText.setText(
            objective.description
        );
    }


    // =============================================================
    // UPDATE
    // =============================================================

    update(time, delta) {
        this.updatePlayer(time, delta);
        this.player?.updateAnimation?.(delta);
        this.combatSystem?.update(time);
        ProjectileSystem.update(this, delta);

        if (this.enemy?.active) {
            this.enemy.body.setVelocityX(0);
            if (this.enemy.body.blocked.down) this.enemy.body.setVelocityY(0);
            this.enemy.x = Phaser.Math.Clamp(this.enemy.x, 120, this.worldWidth - 120);
            this.updateEnemyHP();
        }

        this.player.syncVisual();
        this.updateSigilHUD();
    }


    updateSigilHUD() {
        if (!this.sigilHud) return;
        const selected = this.player?.selectedSigils ?? [];
        for (const item of this.sigilHud) {
            const active = selected.includes(item.sigil);
            item.icon.setAlpha(active ? 1 : 0.65);
            item.slot.setStrokeStyle(2, active ? 0xffd86b : 0xffffff, active ? 0.95 : 0.2);
            item.slot.setFillStyle(active ? 0x3a2b12 : 0x000000, active ? 0.55 : 0.25);
        }
    }

    exitTutorial() {
        this.tutorialSystem?.destroy();
        this.scene.start('CharacterSelectScene', { mode: 'tutorial' });
    }

    // =============================================================
    // CLEANUP
    // =============================================================

    shutdown() {

        if (this._tutorialEscHandler) this.input.keyboard.off('keydown-ESC', this._tutorialEscHandler);
        if (this._attackDownHandler) this.input.keyboard.off('keydown', this._attackDownHandler);
        if (this._attackUpHandler) this.input.keyboard.off('keyup', this._attackUpHandler);
        this.combatSystem?.reset?.();
        this.combatSystem?.destroyChargeFx?.();
        this.inputManager?.destroy();
        this.tutorialSystem?.destroy();

        this.eventBus?.clear();
    }


    destroy() {

        this.shutdown();
    }
}
