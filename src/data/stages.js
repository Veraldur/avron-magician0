export const STAGES = [
    {
        id: 'stage_01',
        name: 'Предел пепла',
        kind: 'main',
        ground: {
            texture: 'terrain_road',
            displayHeight: 130,
            surfaceInset: 24,
            depth: 10
        },
        upperPlatforms: [
            { x: 850, y: 500, width: 650, height: 110, texture: 'terrain_bridge', physics: { width: 598, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 2050, y: 405, width: 760, height: 105, texture: 'terrain_platform', physics: { width: 699, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 3350, y: 520, width: 620, height: 105, texture: 'terrain_ledge', physics: { width: 570, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 4550, y: 350, width: 780, height: 105, texture: 'terrain_bridge', physics: { width: 718, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 5900, y: 470, width: 700, height: 105, texture: 'terrain_platform', physics: { width: 644, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 7150, y: 330, width: 820, height: 105, texture: 'terrain_ledge', physics: { width: 754, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 8500, y: 500, width: 650, height: 105, texture: 'terrain_bridge', physics: { width: 598, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 9750, y: 390, width: 760, height: 105, texture: 'terrain_platform', physics: { width: 699, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 11100, y: 500, width: 700, height: 105, texture: 'terrain_ledge', physics: { width: 644, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 12400, y: 340, width: 850, height: 105, texture: 'terrain_bridge', physics: { width: 782, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 13600, y: 480, width: 520, height: 105, texture: 'terrain_platform', physics: { width: 478, height: 56, oneWay: true, surfaceInset: 18 } }
        ],
        spawns: [
            { x: 1050, row: 0, type: 'grunt' },
            { x: 1500, row: -1, type: 'grunt' },
            { x: 2350, row: 1, type: 'grunt' },
            { x: 3050, row: -1, type: 'grunt' },
            { x: 3550, row: 2, type: 'grunt' },
            { x: 4800, row: 3, type: 'grunt' },
            { x: 6100, row: 4, type: 'grunt' },
            { x: 7350, row: 5, type: 'grunt' },
            { x: 8650, row: 6, type: 'grunt' },
            { x: 10000, row: 7, type: 'grunt' },
            { x: 11250, row: 8, type: 'grunt' },
            { x: 12400, row: 9, type: 'grunt' }
        ]
    },

    {
        id: 'stage_02',
        name: 'Пепельный рубеж',
        kind: 'survival',

        ground: {
            texture: 'terrain_road',
            displayHeight: 130,
            surfaceInset: 24,
            depth: 10
        },

        // Вторая карта использует только terrain_platform.png
        // для всех верхних платформ.
        upperPlatforms: [
            { x: 850, y: 248, width: 700, height: 105, texture: 'terrain_platform', physics: { width: 644, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 1750, y: 303, width: 760, height: 105, texture: 'terrain_platform', physics: { width: 699, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 2750, y: 256, width: 680, height: 105, texture: 'terrain_platform', physics: { width: 625, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 3700, y: 316, width: 820, height: 105, texture: 'terrain_platform', physics: { width: 754, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 4650, y: 251, width: 700, height: 105, texture: 'terrain_platform', physics: { width: 644, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 5600, y: 303, width: 780, height: 105, texture: 'terrain_platform', physics: { width: 718, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 6550, y: 256, width: 700, height: 105, texture: 'terrain_platform', physics: { width: 644, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 7500, y: 311, width: 850, height: 105, texture: 'terrain_platform', physics: { width: 782, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 8450, y: 248, width: 720, height: 105, texture: 'terrain_platform', physics: { width: 662, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 9400, y: 309, width: 800, height: 105, texture: 'terrain_platform', physics: { width: 736, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 10350, y: 256, width: 700, height: 105, texture: 'terrain_platform', physics: { width: 644, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 11300, y: 303, width: 820, height: 105, texture: 'terrain_platform', physics: { width: 754, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 12250, y: 251, width: 700, height: 105, texture: 'terrain_platform', physics: { width: 644, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 13100, y: 316, width: 780, height: 105, texture: 'terrain_platform', physics: { width: 718, height: 56, oneWay: true, surfaceInset: 18 } },
            { x: 5200, y: 168, width: 520, height: 95, texture: 'terrain_platform', physics: { width: 478, height: 52, oneWay: true, surfaceInset: 16 } },
            { x: 8900, y: 176, width: 560, height: 95, texture: 'terrain_platform', physics: { width: 515, height: 52, oneWay: true, surfaceInset: 16 } }
        ],

        // 25 постоянных слотов. Каждый слот проходит четыре жизни:
        // первая жизнь + 3 респавна = 100 убийств.
        spawns: [
            { x: 650, row: -1, type: 'grunt' },
            { x: 1100, row: 0, type: 'shooter' },
            { x: 1450, row: -1, type: 'hunter' },
            { x: 1900, row: 1, type: 'flying' },
            { x: 2350, row: -1, type: 'grunt' },
            { x: 2850, row: 2, type: 'shooter' },
            { x: 3250, row: -1, type: 'hunter' },
            { x: 3850, row: 3, type: 'flying' },
            { x: 4300, row: -1, type: 'grunt' },
            { x: 4800, row: 4, type: 'shooter' },
            { x: 5250, row: 14, type: 'hunter' },
            { x: 5750, row: 5, type: 'flying' },
            { x: 6200, row: -1, type: 'grunt' },
            { x: 6700, row: 6, type: 'shooter' },
            { x: 7200, row: -1, type: 'hunter' },
            { x: 7650, row: 7, type: 'flying' },
            { x: 8150, row: -1, type: 'grunt' },
            { x: 8550, row: 8, type: 'shooter' },
            { x: 9000, row: 15, type: 'hunter' },
            { x: 9500, row: 9, type: 'flying' },
            { x: 10050, row: -1, type: 'grunt' },
            { x: 10550, row: 10, type: 'shooter' },
            { x: 11450, row: 11, type: 'boss_roaming' },
            { x: 12400, row: 12, type: 'hunter' },
            { x: 13200, row: 13, type: 'flying' }
        ],

        objective: {
            type: 'kill_count',
            targetKills: 100,
            respawnEnabled: true,
            respawnsPerSlot: 3
        }
    }
];

export const getStageData = index => STAGES[index] || STAGES[0];
