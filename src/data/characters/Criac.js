export const CRIAC = Object.freeze({
    id: 'criac',
    name: 'Криак',
    description: 'Воин воды, света, эфира и времени.',
    stats: { speed:315, jumpVelocity:880, maxHP:110, dashMultiplier:1.08, bodyWidth:42, bodyHeight:74, visualWidth:106, visualHeight:142, gravity:1350 },
    sigils: { initial:['water','light','ether','time'], max:4 },
    controls: { water:'sigil1', light:'sigil2', ether:'sigil3', time:'sigil4' },
    visual: {
        idle1:'criac_idle_1', idle2:'criac_idle_2', walk1:'criac_walk_1', walk2:'criac_walk_2',
        jump1:'criac_jump_1', jump2:'criac_jump_2', attack1:'criac_attack_1', attack2:'criac_attack_2',
        attack3:'criac_attack_3', attack4:'criac_attack_4', cast1:'criac_cast_1', cast2:'criac_cast_2',
        aura:'criac_aura', fallback:'criac_walk_2', tint:0xffffff
    }
});
export default CRIAC;
