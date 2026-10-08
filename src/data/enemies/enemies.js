export const ENEMIES = Object.freeze({

    grunt: {
        id: 'grunt',
        name: 'Пепельный воин',

        texture: 'enemy',

        body: {
            width: 30,
            height: 58
        },

        visual: {
            width: 52,
            height: 68,
            originY: 1,
            depth: 20
        },

        stats: {
            hp: 4,
            speed: 105,
            contactDamage: 12,
            aggroDistance: 800
        },

        physics: {
            gravity: 1350,
            allowGravity: true,
            immovable: false
        },

        movement: {
            mode: 'ground',
            patrolSpeedMultiplier: 0.42,

            // Враг НЕ прыгает и НЕ спрыгивает с платформы.
            canJump: false,
            canDrop: false,

            // Если впереди нет поверхности на той же высоте,
            // враг разворачивается.
            edgeTurn: false,

            edgeProbeDistance: 18
        },

        attacks: {
            contact: true,
            abilities: []
        },

        loot: {
            gems: {
                min: 1,
                max: 3
            },
            remnants: 3
        }
    },

    shooter: {
        id: 'shooter',
        name: 'Пепельный стрелок',

        texture: 'enemy',

        body: {
            width: 30,
            height: 58
        },

        visual: {
            width: 52,
            height: 68,
            originY: 1,
            depth: 20
        },

        stats: {
            hp: 5,
            speed: 72,
            contactDamage: 8,
            aggroDistance: 900
        },

        physics: {
            gravity: 1350,
            allowGravity: true,
            immovable: false
        },

        movement: {
            mode: 'ground',
            patrolSpeedMultiplier: 0.32,
            canJump: false,
            canDrop: false,
            edgeTurn: false,
            edgeProbeDistance: 18
        },

        attacks: {
            contact: true,

            abilities: [
                {
                    id: 'fireball',
                    cooldown: 1800,
                    range: 720,
                    minRange: 0,
                    damage: 2,
                    projectileSpeed: 620,
                    projectileLifetime: 2200
                }
            ]
        },

        loot: {
            gems: {
                min: 2,
                max: 5
            },
            remnants: 3
        }
    },

    hunter: {
        id: 'hunter',
        name: 'Охотник',

        texture: 'enemy',

        body: {
            width: 30,
            height: 58
        },

        visual: {
            width: 54,
            height: 70,
            originY: 1,
            depth: 20
        },

        stats: {
            hp: 7,
            speed: 145,
            contactDamage: 16,
            aggroDistance: 1000
        },

        physics: {
            gravity: 1350,
            allowGravity: true,
            immovable: false
        },

        movement: {
            mode: 'ground',
            patrolSpeedMultiplier: 0.50,
            canJump: false,
            canDrop: false,
            edgeTurn: false,
            edgeProbeDistance: 22
        },

        attacks: {
            contact: true,
            abilities: [
                {
                    id: 'shadowBurst',
                    cooldown: 2600,
                    range: 280,
                    damage: 3
                }
            ]
        },

        loot: {
            gems: {
                min: 3,
                max: 7
            },
            remnants: 4
        }
    },

    flying: {
        id: 'flying',
        name: 'Эфирный охотник',

        texture: 'enemy',

        body: {
            width: 34,
            height: 42
        },

        visual: {
            width: 58,
            height: 58,
            originY: 0.5,
            depth: 20
        },

        stats: {
            hp: 6,
            speed: 120,
            contactDamage: 14,
            aggroDistance: 1000
        },

        physics: {
            gravity: 0,
            allowGravity: false,
            immovable: false
        },

        movement: {
            mode: 'flying',
            patrolSpeedMultiplier: 0.55,

            // Для летающего врага ограничения платформ не применяются.
            canJump: false,
            canDrop: true,
            edgeTurn: false
        },

        attacks: {
            contact: true,
            abilities: [
                {
                    id: 'etherShot',
                    cooldown: 1500,
                    range: 850,
                    minRange: 0,
                    damage: 2,
                    projectileSpeed: 540,
                    projectileLifetime: 2500
                }
            ]
        },

        loot: {
            gems: {
                min: 3,
                max: 6
            },
            remnants: 4
        }
    },

    boss_roaming: {
        id: 'boss_roaming',
        name: 'Великий Страж',

        texture: 'enemy',

        boss: true,

        body: {
            width: 168,
            height: 220
        },

        visual: {
            width: 210,
            height: 250,
            originY: 1,
            depth: 21
        },

        stats: {
            hp: 500,
            speed: 82,
            contactDamage: 28,
            aggroDistance: 2200
        },

        physics: {
            gravity: 1350,
            allowGravity: true,
            immovable: false
        },

        movement: {
            mode: 'boss_roaming',
            patrolSpeedMultiplier: 1,

            canJump: false,
            canDrop: false,

            // Босс может двигаться по всей своей зоне,
            // но пока не прыгает между ярусами.
            edgeTurn: false,
            edgeProbeDistance: 34
        },

        attacks: {
            contact: true,

            abilities: [
                {
                    id: 'bossFireball',
                    cooldown: 1900,
                    range: 1400,
                    minRange: 0,
                    damage: 8,
                    projectileSpeed: 500,
                    projectileLifetime: 3200
                },
                {
                    id: 'bossBurst',
                    cooldown: 4200,
                    range: 520,
                    damage: 12
                }
            ]
        },

        bossConfig: {
            mode: 'roaming',
            healthBar: 'boss',
            phases: [
                { hpPercent: 0.66, speedMultiplier: 1.15 },
                { hpPercent: 0.33, speedMultiplier: 1.35 }
            ]
        },

        loot: {
            gems: {
                min: 40,
                max: 70
            },
            remnants: 10
        }
    }

});

export function getEnemyData(id) {
    return ENEMIES[id] ?? ENEMIES.grunt;
}

export function hasEnemyData(id) {
    return Boolean(ENEMIES[id]);
}

export function listEnemyData() {
    return Object.values(ENEMIES);
}