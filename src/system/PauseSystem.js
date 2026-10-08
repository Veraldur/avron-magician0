export class PauseSystem {
    constructor(scene) {
        this.scene = scene;
        this.root = null;
        this.shade = null;
        this.buttons = [];
        this.index = 0;
        this.visible = false;
    }

    create() {
        const scene = this.scene;
        const width = scene.scale.width;
        const height = scene.scale.height;

        this.root = scene.add.container(width / 2, height / 2)
            .setScrollFactor(0)
            .setDepth(120)
            .setVisible(false);

        const shade = scene.add.rectangle(0, 0, width, height, 0x050509, 0.72);
        this.shade = shade;
        const panel = scene.add.rectangle(0, 0, 520, 470, 0x090b16, 0.98)
            .setStrokeStyle(2, 0x666d91);

        this.root.add([shade, panel]);
        this.root.add(scene.add.text(0, -185, 'ПАУЗА', {
            fontFamily: 'Arial', fontSize: '40px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5));

        const labels = [
            'ПРОДОЛЖИТЬ',
            'РЕЦЕПТЫ',
            'НАЧАТЬ ЗАНОВО',
            'ВЫБОР СТАДИИ',
            'ГЛАВНОЕ МЕНЮ'
        ];

        labels.forEach((label, i) => {
            const y = -105 + i * 62;
            const bg = scene.add.rectangle(0, y, 340, 48, 0x111526, 1)
                .setStrokeStyle(2, 0x555577)
                .setInteractive({ useHandCursor: true });
            const text = scene.add.text(0, y, label, {
                fontFamily: 'Arial', fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);
            this.root.add([bg, text]);

            const activate = () => this.activate(i);
            bg.on('pointerdown', activate);
            text.setInteractive({ useHandCursor: true }).on('pointerdown', activate);
            bg.on('pointerover', () => this.setSelection(i));
            this.buttons.push({ bg, text });
        });

        this.root.add(scene.add.text(0, 190, 'ESC — продолжить   ↑ ↓ — выбор   мышь — выбрать', {
            fontFamily: 'Arial', fontSize: '13px', color: '#8f96b5'
        }).setOrigin(0.5));

        this.setSelection(0);
        return this;
    }

    setSelection(index) {
        this.index = Phaser.Math.Wrap(index, 0, this.buttons.length);
        this.buttons.forEach((button, i) => {
            const selected = i === this.index;
            button.bg.setFillStyle(selected ? 0x24243a : 0x111526);
            button.bg.setStrokeStyle(2, selected ? 0x9ba2c2 : 0x555577);
            button.text.setColor(selected ? '#ffffff' : '#b9c3e8');
        });
    }

    toggle() {
        if (this.visible) this.hide();
        else this.show();
    }

    show() {
        if (!this.root) this.create();
        this.visible = true;
        this.root.setVisible(true);
        this.scene.isPaused = true;
        this.scene.physics.world.pause();
    }

    hide() {
        this.visible = false;
        this.root?.setVisible(false);
        this.scene.isPaused = false;
        this.scene.physics.world.resume();
    }

    move(delta) {
        if (!this.visible) return;
        this.setSelection(this.index + delta);
    }

    activate(index) {
        switch (index) {
            case 0:
                this.hide();
                break;
            case 1:
                this.hide();
                this.scene.toggleRecipePanel(true);
                break;
            case 2:
                this.scene.restartGame();
                break;
            case 3:
                this.hide();
                this.scene.scene.start('StageSelectScene', {
                    characterId: this.scene.characterId,
                    mode: 'adventure'
                });
                break;
            case 4:
                this.hide();
                this.scene.scene.start('MainMenuScene');
                break;
        }
    }

    resize() {
        if (!this.root) return;
        this.root.setPosition(this.scene.scale.width / 2, this.scene.scale.height / 2);
        this.shade?.setSize(this.scene.scale.width, this.scene.scale.height);
    }

    destroy() {
        this.root?.destroy(true);
        this.root = null;
        this.shade = null;
        this.buttons.length = 0;
        this.scene = null;
    }
}

export default PauseSystem;
