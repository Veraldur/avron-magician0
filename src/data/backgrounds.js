export const BACKGROUNDS = Object.freeze({

    // =========================================================
    // STAGE 01 — горная долина
    // =========================================================
    stage_01: {

        base: {
            color: 0x17151d
        },

        far: {
            keys: [
                'bg_ash_far_03'
            ],

            parallaxX: 0.08,
            alpha: 1
        },

        mid: {
            keys: [
                'bg_ash_mid_01',
                'bg_ash_mid_02'
            ],

            parallaxX: 0.20,
            alpha: 0.92
        },


        // Ближний туман.
        // Очень слабый, чтобы сохранить читаемость уровня.
        near: {
            keys: [
                'bg_ash_near_01',
                'terrain_fog'
            ],

            parallaxX: 0.38,
            alpha: 0.70
        },

        atmosphere: {
            alpha: 0.0
        }
    },


    // =========================================================
    // STAGE 02 — ПЕПЕЛ
    // =========================================================
    stage_02: {

        base: {
            color: 0x17151d
        },

        far: {
            keys: [
                'bg_ash_far_03'
            ],

            parallaxX: 0.08,
            alpha: 1
        },

        mid: {
            keys: [
                'bg_ash_mid_01',
                'bg_ash_mid_02'
            ],

            parallaxX: 0.20,
            alpha: 0.92
        },

        near: {
            keys: [
                'bg_ash_near_01',
                'terrain_fog'
            ],

            parallaxX: 0.38,
            alpha: 0.70
        },

        atmosphere: {
            alpha: 0.0
        }
    }
});


export function getBackgroundData(stageId) {
    return BACKGROUNDS[stageId] ?? BACKGROUNDS.stage_01;
}


export default BACKGROUNDS;