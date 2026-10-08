export const CRIAC_RECIPES = Object.freeze([
    { id:'criac_water', name:'Водный снаряд', sigils:['water'], mode:'cast', ability:'waterProjectile' },
    { id:'criac_light', name:'Световой импульс', sigils:['light'], mode:'cast', ability:'lightBurst' },
    { id:'criac_ether', name:'Эфирный импульс', sigils:['ether'], mode:'cast', ability:'energyExplosion' },
    { id:'criac_time', name:'Импульс времени', sigils:['time'], mode:'cast', ability:'timePulse' },
    { id:'criac_water_water', name:'Водный залп', sigils:['water','water'], mode:'auto', ability:'waterBurst' },
    { id:'criac_light_light', name:'Световой рывок', sigils:['light','light'], mode:'auto', ability:'lightDash' },
    { id:'criac_ether_ether', name:'Эфирный взрыв', sigils:['ether','ether'], mode:'auto', ability:'energyExplosion' },
    { id:'criac_time_time', name:'Скачок времени', sigils:['time','time'], mode:'auto', ability:'timeJump' },
    { id:'criac_water_light', name:'Приливный рывок', sigils:['water','light'], mode:'cast', ability:'waterLightDash' },
    { id:'criac_ether_water', name:'Эфирная волна', sigils:['ether','water'], mode:'cast', ability:'energyExplosion' },
    { id:'criac_ether_light', name:'Эфирный свет', sigils:['ether','light'], mode:'cast', ability:'lightBurst' },
    { id:'criac_ether_time', name:'Эфирный разрыв времени', sigils:['ether','time'], mode:'cast', ability:'timeStop' },
    { id:'criac_light_time', name:'Остановка времени', sigils:['light','time'], mode:'cast', ability:'timeStop' },
    { id:'criac_water_time', name:'Временная волна', sigils:['water','time'], mode:'cast', ability:'timeWave' },
    { id:'criac_ether_light_time', name:'Эфирная остановка времени', sigils:['ether','light','time'], mode:'cast', ability:'timeStop' },
    { id:'criac_ether_water_light', name:'Эфирный прилив', sigils:['ether','water','light'], mode:'cast', ability:'waterLightDash' },
    { id:'criac_ether_water_time', name:'Эфирная временная волна', sigils:['ether','water','time'], mode:'cast', ability:'timeWave' },
    { id:'criac_ether_light_light', name:'Световой эфирный рывок', sigils:['ether','light','light'], mode:'cast', ability:'lightDash' },
    { id:'criac_ether_time_time', name:'Эфирный скачок времени', sigils:['ether','time','time'], mode:'cast', ability:'timeJump' },
    { id:'criac_light_light_time', name:'Световая остановка времени', sigils:['light','light','time'], mode:'cast', ability:'timeStop' },
    { id:'criac_light_time_time', name:'Световая временная волна', sigils:['light','time','time'], mode:'cast', ability:'timeWave' },
    { id:'criac_water_light_time', name:'Прилив времени', sigils:['water','light','time'], mode:'cast', ability:'timeStop' },
    { id:'criac_water_water_time', name:'Водная временная волна', sigils:['water','water','time'], mode:'cast', ability:'timeWave' },
    { id:'criac_water_light_light', name:'Световой прилив', sigils:['water','light','light'], mode:'cast', ability:'lightDash' },
    { id:'criac_water_water_light', name:'Водный световой залп', sigils:['water','water','light'], mode:'cast', ability:'waterBurst' }
]);

export default CRIAC_RECIPES;
