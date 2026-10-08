export const INGOR = {
    id: 'ingor',

    name: 'Ингор',

    description: 'Повелитель пламени и теней.',

    stats: {
        speed: 300,
        jumpVelocity: 850,
        maxHP: 100,
        dashMultiplier: 1
    },

    sigils: {
        initial: [
            'flame',
            'shadow',
            'ether',
            'gravis'
        ],

        max: 4
    },

    visual: {
        idle1: 'p_idle_1',
        idle2: 'p_idle_2',

        walk1: 'p_walk_1',
        walk2: 'p_walk_2',

        jump1: 'p_jump_1',
        jump2: 'p_jump_2',

        tint: 0xffffff
    }
};