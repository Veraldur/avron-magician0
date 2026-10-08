export const GAME_CONFIG = {
    WORLD: {
        width: 14000,
        height: 1200
    },

    PLAYER: {
        speed: 330,
        jumpVelocity: 640,
        gravity: 1350,
        maxHP: 100,
        visualWidth: 58,
        visualHeight: 76,
        bodyWidth: 30,
        bodyHeight: 58
    },

    ATTACK: {
        damage: 1,
        cooldown: 260,
        range: 125,
        knockbackX: 0,
        knockbackY: 0,
        hitStun: 180,

        // Атака теперь имеет startup → active → recovery.
        // Strong срабатывает при удержании клавиши.
        strongChargeMs: 420,
        profiles: {
            normal: {
                startup: 70,
                active: 70,
                recovery: 150,
                width: 135,
                height: 105,
                offsetX: 76,
                damage: 1,
                hitStun: 180,
                hitstop: 24,
                shake: 2
            },
            move: {
                startup: 45,
                active: 75,
                recovery: 135,
                width: 155,
                height: 105,
                offsetX: 92,
                damage: 1,
                lungeSpeed: 460,
                knockbackX: 260,
                knockbackY: -70,
                hitStun: 200,
                hitstop: 26,
                shake: 2
            },
            up: {
                startup: 55,
                active: 80,
                recovery: 145,
                width: 105,
                height: 150,
                verticalOffset: 82,
                damage: 2,
                lungeLift: 720,
                jumpVelocity: 760,
                knockbackY: -420,
                hitStun: 240,
                hitstop: 30,
                shake: 2,
                repeatHitMs: 70,
                hitUntilLanding: true
            },
            strong: {
                startup: 115,
                active: 90,
                recovery: 230,
                width: 190,
                height: 190,
                offsetX: 0,
                radius: 190,
                damage: 4,
                knockbackX: 320,
                knockbackY: -170,
                hitStun: 320,
                hitstop: 55,
                shake: 5
            }
        }
    },

    PROJECTILE: {
        baseDamage: 2,
        baseSpeed: 900,
        lifetime: 1800,
        size: 40
    },

    DASH: {
        shadowSpeed: 1200,
        fireSpeed: 1300,
        explosiveSpeed: 1400,
        shadowDuration: 900,
        fireDuration: 900,
        explosiveDuration: 950,
        lightSpeed: 1350,
        waterLightSpeed: 1450,
        lightDuration: 900,
        waterLightDuration: 950
    },

    MAGIC: {
        jumpVelocity: 850,
        levitateTime: 1800,
        liftRadius: 300,
        liftHeight: 180,
        liftRiseDuration: 360,
        liftDuration: 1800,
        liftTopMargin: 70,
        liftBottomMargin: 70,
        energyExplosionGemCost: 10
    },

    SUPER: {
        meterMax: 100,
        duration: 8000,
        damageMultiplier: 2,
        speedMultiplier: 1.12,
        attackSet: 'super',
        formAttackMultiplier: 2.0,
        auraRadius: 125,
        auraDamage: 2,
        auraTick: 260
    },

    ENEMY: {
        hp: 4,
        speed: 105,
        contactDamage: 12,
        aggroDistance: 800
    },

    STAGE: {
        count: 1,
        enemiesPerStage: 9,
        lockMargin: 34
    },

    PICKUP: {
        autoCollectRadius: 75,
        minSpawnDistanceFromSource: 150,
        maxSpawnDistanceFromSource: 200,
        verticalSpread: 0.25
    },

    LOOT: {
        remnantsFromEnemy: 3
    },

    CAMERA: {
        lerpX: 0.12,
        lerpY: 0.12
    },

    PLATFORM: {
        height: 24
    },

    MOVING_PLATFORMS: {
        perStage: 4,
        speedMin: 70,
        speedMax: 130,
        widthMin: 130,
        widthMax: 240,
        height: 18
    },

    BACKGROUND: {
        far: {
            parallaxX: 0.08,
            parallaxY: 0.035
        },

        mid: {
            parallaxX: 0.20,
            parallaxY: 0.10
        },

        near: {
            parallaxX: 0.38,
            parallaxY: 0.18
        }
    },

    MINIMAP: {
        width: 250,
        height: 96,
        margin: 18,
        updateInterval: 80
    }
};

export default GAME_CONFIG;
