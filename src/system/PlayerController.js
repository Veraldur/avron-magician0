import { AbilitySystem } from './AbilitySystem.js';

export class PlayerController {
    constructor(scene, player, worldSystem = null) {
        this.scene = scene;
        this.player = player;
        this.world = worldSystem ?? scene.worldSystem;

        // Совместимость с текущими системами.
        scene.playerController = this;

        this.playerBody = player?.body ?? scene.playerBody ?? null;

        this.lastDirection = 1;
    }

    get body() {
        return this.player?.body ?? this.playerBody ?? this.scene.playerBody ?? null;
    }

    get keys() {
        return this.scene.keys ?? null;
    }

    update(time, delta) {
        const body = this.body;

        if (!body?.body) return;

        this.updateMovement(time, delta);
    }

    updateMovement(time, delta) {
        const body = this.body;
        const physicsBody = body?.body;

        if (!physicsBody) return;

        // ------------------------------------------------------------
        // DASH
        // ------------------------------------------------------------

        if (physicsBody.isDashing) {
            if (time < physicsBody.dashUntil) {
                physicsBody.setVelocityX(
                    physicsBody.dashVelocityX
                );

                physicsBody.setVelocityY(0);

                return;
            }

            physicsBody.isDashing = false;
            physicsBody.dashUntil = 0;
            physicsBody.dashVelocityX = 0;
            physicsBody.isInvulnerable = false;

            physicsBody.setVelocityX(0);
        }

        const keys = this.keys;

        if (!keys) return;

        // ------------------------------------------------------------
        // HORIZONTAL MOVEMENT
        // ------------------------------------------------------------

        let direction = 0;

        if (keys.left?.isDown) {
            direction -= 1;
        }

        if (keys.right?.isDown) {
            direction += 1;
        }

        const speed =
            this.player?.stats?.speed ??
            this.scene.CONFIG.PLAYER.speed;

        if (direction !== 0) {
            physicsBody.setVelocityX(
                direction * speed
            );

            this.lastDirection = direction;

            body.facing = direction;

            this.player?.emitAction?.('move');
        } else if (!physicsBody.isDashing) {
            physicsBody.setVelocityX(0);
        }

        // ------------------------------------------------------------
        // JUMP / DOUBLE JUMP
        // ------------------------------------------------------------

        if (
            keys.jump &&
            Phaser.Input.Keyboard.JustDown(keys.jump)
        ) {
            const jumpVelocity =
                this.player?.stats?.jumpVelocity ??
                this.scene.CONFIG.PLAYER.jumpVelocity;

            if (physicsBody.blocked.down) {
                physicsBody.setVelocityY(
                    -Math.abs(jumpVelocity)
                );

                physicsBody.canDoubleJump = true;

                this.player?.emitAction?.('jump');
            } else if (physicsBody.canDoubleJump) {
                physicsBody.setVelocityY(
                    -Math.abs(jumpVelocity) * 0.92
                );

                physicsBody.canDoubleJump = false;

                this.player?.emitAction?.('jump');
            }
        }

        // ------------------------------------------------------------
        // DROP THROUGH PLATFORM
        // ------------------------------------------------------------

        if (
            keys.down &&
            Phaser.Input.Keyboard.JustDown(keys.down) &&
            physicsBody.blocked.down
        ) {
            this.dropToLowerPlatform();
        }

        // ------------------------------------------------------------
        // BASIC ATTACK
        // ------------------------------------------------------------

        if (
            keys.attack &&
            Phaser.Input.Keyboard.JustDown(keys.attack)
        ) {
            this.tryBasicAttack(time);

            this.player?.emitAction?.('attack');
        }
    }

    dropToLowerPlatform() {
        const body = this.body;
        const physicsBody = body?.body;

        if (!physicsBody) return;

        if (!physicsBody.blocked.down) {
            return;
        }

        const platforms =
            this.world?.levelPlatforms ??
            this.scene.levelPlatforms ??
            [];

        const x = body.x;
        const bottom = physicsBody.bottom;

        const currentPlatform = platforms.find(platform => {
            if (!platform || platform.isGround) {
                return false;
            }

            if (
                platform.stageIndex !==
                this.scene.currentStageIndex
            ) {
                return false;
            }

            const left =
                platform.x -
                platform.width / 2;

            const right =
                platform.x +
                platform.width / 2;

            if (x < left || x > right) {
                return false;
            }

            return Math.abs(
                platform.surfaceY - bottom
            ) < 14;
        });

        if (!currentPlatform) {
            return;
        }

        /*
         * Не отключаем столкновения вообще.
         * Запоминаем платформу, через которую нужно пройти.
         */

        physicsBody.isDropping = true;
        physicsBody.dropThroughPlatform =
            currentPlatform;

        physicsBody.checkCollision.none = true;

        physicsBody.setVelocityY(220);

        this.scene.time.delayedCall(260, () => {
            if (!physicsBody?.gameObject?.active) {
                return;
            }

            physicsBody.checkCollision.none = false;
            physicsBody.isDropping = false;
            physicsBody.dropThroughPlatform = null;
        });
    }

    tryBasicAttack(time) {
        if (
            typeof this.scene.combatSystem
                ?.tryBasicAttack === 'function'
        ) {
            this.scene.combatSystem.tryBasicAttack(time);
            return;
        }

        /*
         * CombatSystem пока может отсутствовать.
         * Никакой боевой логики здесь не дублируем.
         */
    }

    damage(amount) {
        if (
            typeof this.scene.combatSystem
                ?.damagePlayer === 'function'
        ) {
            return this.scene.combatSystem.damagePlayer(amount);
        }

        return false;
    }

    respawn() {
        this.player?.respawn?.();

        this.scene.playerHP =
            this.player?.stats?.maxHP ??
            this.scene.playerHP;

        this.scene.updateHPUI?.();
    }

    destroy() {
        this.scene = null;
        this.player = null;
        this.world = null;
        this.playerBody = null;
    }
}

export default PlayerController;