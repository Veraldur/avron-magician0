import Start from './Start.js';
import MainScene from './MainScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import GameModeScene from './scenes/GameModeScene.js';
import CharacterSelectScene from './scenes/CharacterSelectScene.js';
import SettingsScene from './scenes/SettingsScene.js';
import TutorialScene from './scenes/TutorialScene.js';
import StageSelectScene from './scenes/StageSelectScene.js';
import MusicManager from './audio/MusicManager.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#050509',
    render: {
        antialias: true,
        pixelArt: false,
        roundPixels: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
            fps: 60
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
    },
    scene: [
        Start,
        MainScene,
        GameModeScene,
        CharacterSelectScene,
        SettingsScene,
        TutorialScene,
        StageSelectScene,
        MainMenuScene
    ]
};

const game = new Phaser.Game(config);

// Музыка существует на уровне всего Phaser.Game, а не отдельной Scene.
// Поэтому она не обрывается при переходе Меню → Режим → Персонаж → Игра.
const musicManager = new MusicManager(game);
game.registry.set('musicManager', musicManager);
