export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    preload() {
        this.load.image('menu_bg', 'assets/menu/menu_bg.png');

        this.load.audio('avron_test', 'assets/audio/music/avron_test.mp3');
        this.load.audio('avron_test2', 'assets/audio/music/avron_test2.mp3');
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.cameras.main.setBackgroundColor('#050509');
        this.musicManager = this.registry.get('musicManager');
        this.menuItems = [];
        this.menuIndex = 0;

        this.menuBackground = this.add.image(width / 2, height / 2, 'menu_bg')
            .setOrigin(0.5)
            .setDepth(0);

        const scaleX = (width + 120) / this.menuBackground.width;
        const scaleY = (height + 120) / this.menuBackground.height;
        this.menuBackground.setScale(Math.max(scaleX, scaleY));

        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.38).setDepth(1);

        this.add.text(width / 2, height * 0.22, 'Avron: Magician', {
            fontFamily: 'Arial',
            fontSize: '76px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(2);

        this.add.text(width / 2, height * 0.29, 'ACTION PLATFORMER', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#b0b0c0',
            letterSpacing: 4
        }).setOrigin(0.5).setDepth(2);

        this.createButton(width / 2, height * 0.48, 'ИГРАТЬ', () => {
            this.startOrResumeMusic();
            this.scene.start('GameModeScene');
        });

        this.createButton(width / 2, height * 0.58, 'НАСТРОЙКИ', () => {
            this.startOrResumeMusic();
            this.scene.start('SettingsScene');
        });

        this.createButton(width / 2, height * 0.68, 'ВЫХОД', () => {
            // В браузере вкладку закрывать нельзя.
        });

        this.setSelection(0);
        this.input.keyboard.on('keydown-UP', () => this.setSelection(this.menuIndex - 1));
        this.input.keyboard.on('keydown-DOWN', () => this.setSelection(this.menuIndex + 1));
        this.input.keyboard.on('keydown-ENTER', () => this.menuItems[this.menuIndex]?.callback());

        // Переключение треков мышью.
        this.createMusicButton(width / 2 - 180, height * 0.82, '<', () => this.changeMusic(-1));
        this.createMusicButton(width / 2 + 180, height * 0.82, '>', () => this.changeMusic(1));

        this.musicText = this.add.text(width / 2, height * 0.82, '', {
            fontFamily: 'Arial',
            fontSize: '15px',
            color: '#b9c3e8'
        }).setOrigin(0.5).setDepth(3);

        this.updateMusicUI();
        this.startOrResumeMusic();

        this.parallaxX = 0;
        this.parallaxY = 0;

        this.input.on('pointermove', pointer => {
            this.parallaxX = (pointer.x / width - 0.5) * 24;
            this.parallaxY = (pointer.y / height - 0.5) * 14;
        });

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
    }

    startOrResumeMusic() {
        if (!this.musicManager) return;
        this.musicManager.ensureStarted();
        this.updateMusicUI();
    }

    changeMusic(direction) {
        if (!this.musicManager) return;

        if (direction > 0) {
            this.musicManager.next();
        } else {
            this.musicManager.previous();
        }

        this.musicManager.ensureStarted();
        this.updateMusicUI();
    }

    updateMusicUI() {
        if (!this.musicText || !this.musicManager) return;

        this.musicText.setText(
            `♫ ${this.musicManager.getCurrentTrackName()}    , / . — сменить`
        );
    }

    createMusicButton(x, y, label, callback) {
        const background = this.add.rectangle(x, y, 54, 44, 0x11111c, 0.9)
            .setStrokeStyle(2, 0x555577)
            .setInteractive({ useHandCursor: true })
            .setDepth(2);

        const text = this.add.text(x, y, label, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(3);

        background.on('pointerdown', callback);
        text.on('pointerdown', callback);

        background.on('pointerover', () => background.setFillStyle(0x24243a, 0.94));
        background.on('pointerout', () => background.setFillStyle(0x11111c, 0.9));
    }

    createButton(x, y, label, callback) {
        const background = this.add.rectangle(x, y, 320, 62, 0x11111c, 0.86)
            .setStrokeStyle(2, 0x555577)
            .setInteractive({ useHandCursor: true })
            .setDepth(2);

        const text = this.add.text(x, y, label, {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(3);

        background.on('pointerdown', callback);
        text.on('pointerdown', callback);

        background.on('pointerover', () => background.setFillStyle(0x24243a, 0.94));
        background.on('pointerout', () => background.setFillStyle(0x11111c, 0.86));

        this.menuItems.push({ background, text, callback });
    }

    setSelection(index) {
        if (!this.menuItems.length) return;
        this.menuIndex = Phaser.Math.Wrap(index, 0, this.menuItems.length);
        this.menuItems.forEach((item, i) => {
            const selected = i === this.menuIndex;
            item.background.setFillStyle(selected ? 0x24243a : 0x11111c, selected ? 0.94 : 0.86);
            item.background.setStrokeStyle(2, selected ? 0x9ba2c2 : 0x555577);
            item.text.setColor(selected ? '#ffffff' : '#b9c3e8');
        });
    }

    update() {
        if (!this.menuBackground) return;

        this.menuBackground.x = this.scale.width / 2 + this.parallaxX;
        this.menuBackground.y = this.scale.height / 2 + this.parallaxY;
    }

    cleanup() {}
}
