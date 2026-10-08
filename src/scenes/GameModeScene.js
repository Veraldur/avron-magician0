export default class GameModeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameModeScene' });
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;
        this.cameras.main.setBackgroundColor('#08080d');
        this.menuItems = [];
        this.menuIndex = 0;

        this.add.text(w / 2, 100, 'ИГРАТЬ', {
            fontFamily: 'Arial', fontSize: '54px', color: '#fff', fontStyle: 'bold'
        }).setOrigin(.5);

        this.createButton(w / 2, 270, 'ОБУЧЕНИЕ', () => this.scene.start('CharacterSelectScene', { mode: 'tutorial' }));
        this.createButton(w / 2, 370, 'ПРИКЛЮЧЕНИЕ', () => this.scene.start('CharacterSelectScene', { mode: 'adventure' }));
        this.createButton(w / 2, 470, 'ПОДЗЕМЕЛЬЕ', () => {});

        const back = this.add.text(w / 2, h - 70, 'НАЗАД', {
            fontFamily: 'Arial', fontSize: '22px', color: '#888899'
        }).setOrigin(.5).setInteractive({ useHandCursor: true });
        back.on('pointerdown', () => this.scene.start('MainMenuScene'));

        this.setSelection(0);
        this.input.keyboard.on('keydown-UP', () => this.setSelection(this.menuIndex - 1));
        this.input.keyboard.on('keydown-DOWN', () => this.setSelection(this.menuIndex + 1));
        this.input.keyboard.on('keydown-ENTER', () => this.menuItems[this.menuIndex]?.callback());
        this.input.keyboard.on('keydown-ESC', () => this.scene.start('MainMenuScene'));
    }

    createButton(x, y, label, callback) {
        const bg = this.add.rectangle(x, y, 340, 66, 0x171725)
            .setStrokeStyle(2, 0x555577)
            .setInteractive({ useHandCursor: true });
        const text = this.add.text(x, y, label, {
            fontFamily: 'Arial', fontSize: '24px', color: '#fff'
        }).setOrigin(.5);

        bg.on('pointerdown', callback);
        text.setInteractive({ useHandCursor: true }).on('pointerdown', callback);
        bg.on('pointerover', () => this.setSelection(this.menuItems.findIndex(item => item.bg === bg)));
        bg.on('pointerout', () => {});

        this.menuItems.push({ bg, text, callback });
    }

    setSelection(index) {
        if (!this.menuItems.length) return;
        this.menuIndex = Phaser.Math.Wrap(index, 0, this.menuItems.length);
        this.menuItems.forEach((item, i) => {
            const selected = i === this.menuIndex;
            item.bg.setFillStyle(selected ? 0x24243a : 0x171725);
            item.bg.setStrokeStyle(2, selected ? 0x9ba2c2 : 0x555577);
            item.text.setColor(selected ? '#ffffff' : '#b9c3e8');
        });
    }
}
