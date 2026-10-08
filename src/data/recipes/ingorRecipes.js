export const INGOR_RECIPES = Object.freeze([
    { id:'ingor_flame', name:'Пламенный снаряд', sigils:['flame'], mode:'cast', ability:'fire' },
    { id:'ingor_shadow', name:'Теневой рывок', sigils:['shadow'], mode:'cast', ability:'shadowDash' },
    { id:'ingor_ether', name:'Эфирный импульс', sigils:['ether'], mode:'cast', ability:'energyExplosion' },
    { id:'ingor_gravis', name:'Высокий прыжок', sigils:['gravis'], mode:'cast', ability:'highJump' },
    { id:'ingor_flame_flame', name:'Пламенный снаряд', sigils:['flame','flame'], mode:'auto', ability:'fire' },
    { id:'ingor_shadow_shadow', name:'Теневой рывок', sigils:['shadow','shadow'], mode:'auto', ability:'shadowDash' },
    { id:'ingor_ether_ether', name:'Эфирный взрыв', sigils:['ether','ether'], mode:'auto', ability:'energyExplosion' },
    { id:'ingor_gravis_gravis', name:'Высокий прыжок', sigils:['gravis','gravis'], mode:'auto', ability:'highJump' },
    { id:'ingor_fire_dash', name:'Огненный рывок', sigils:['flame','shadow'], mode:'cast', ability:'fireDash' },
    { id:'ingor_fire_explosion', name:'Огненный взрыв', sigils:['ether','flame'], mode:'cast', ability:'fireExplosion' },
    { id:'ingor_fire_jump', name:'Огненный прыжок', sigils:['flame','gravis'], mode:'cast', ability:'fireJump' },
    { id:'ingor_invisibility', name:'Невидимость', sigils:['ether','shadow'], mode:'cast', ability:'invisibility' },
    { id:'ingor_teleport_up', name:'Телепорт вверх', sigils:['gravis','shadow'], mode:'cast', ability:'teleportUp' },
    { id:'ingor_fire_aura', name:'Огненная аура', sigils:['ether','flame','shadow'], mode:'cast', ability:'fireAura' },
    { id:'ingor_lift_enemies', name:'Подброс всех', sigils:['flame','gravis','shadow'], mode:'cast', ability:'liftEnemies' }
]);

export default INGOR_RECIPES;
