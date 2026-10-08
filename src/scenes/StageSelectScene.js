import { StageSystem } from '../system/StageSystem.js';

export default class StageSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StageSelectScene' });
    }

    init(data) {
        this.characterId = data?.characterId || this.registry.get('characterId') || 'ingor';
        this.selected = Phaser.Math.Clamp(Number(data?.stageIndex ?? 0), 0, Math.max(0, StageSystem.count() - 1));
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;
        this.cameras.main.setBackgroundColor('#08080e');
        this.add.text(w / 2, 70, 'ВЫБОР СТАДИИ', {
            fontFamily: 'Arial', fontSize: '42px', color: '#ffffff', fontStyle: 'bold',
            stroke: '#08080e', strokeThickness: 8
        }).setOrigin(0.5);

        this.add.text(w / 2, 118, '↑ ↓ — выбрать   ENTER — начать   ESC — назад', {
            fontFamily: 'Arial', fontSize: '16px', color: '#9fa8c7'
        }).setOrigin(0.5);

        this.buttons = [];
        for (let i = 0; i < StageSystem.count(); i++) {
            const data = StageSystem.data(i);
            const y = 205 + i * 105;
            const bg = this.add.rectangle(w / 2, y, 520, 76, 0x111526, 0.94)
                .setStrokeStyle(2, 0x555b78)
                .setInteractive({ useHandCursor: true });
            const title = this.add.text(w / 2 - 220, y - 19, `${String(i + 1).padStart(2, '0')}  ${data?.name ?? `Стадия ${i + 1}`}`, {
                fontFamily: 'Arial', fontSize: '23px', color: '#ffffff', fontStyle: 'bold'
            });
            const info = this.add.text(w / 2 - 220, y + 12, i === 1 ? '100 врагов' : 'Зачистить арену', {
                fontFamily: 'Arial', fontSize: '14px', color: '#aab3d0'
            });
            bg.on('pointerdown', () => this.startStage(i));
            this.buttons.push({ bg, title, info });
        }

        const back = this.add.text(w / 2, h - 55, 'ГЛАВНОЕ МЕНЮ', {
            fontFamily: 'Arial', fontSize: '18px', color: '#9fa8c7'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        back.on('pointerdown', () => this.scene.start('MainMenuScene'));

        this.input.keyboard.on('keydown-ENTER', () => this.startStage(this.selected));
        this.input.keyboard.on('keydown-UP', () => this.move(-1));
        this.input.keyboard.on('keydown-DOWN', () => this.move(1));
        this.input.keyboard.on('keydown-ESC', () => this.scene.start('MainMenuScene'));
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.keyboard.removeAllListeners();
        });
        this.refresh();
    }

    move(delta) {
        this.selected = Phaser.Math.Wrap(this.selected + delta, 0, Math.max(1, StageSystem.count()));
        this.refresh();
    }

    refresh() {
        this.buttons.forEach((item, i) => {
            const active = i === this.selected;
            item.bg.setFillStyle(active ? 0x24243a : 0x111526);
            item.bg.setStrokeStyle(3, active ? 0xbfd5ff : 0x555b78);
        });
    }

    startStage(index) {
        this.scene.start('MainScene', { stageIndex: index, characterId: this.characterId });
    }
}
