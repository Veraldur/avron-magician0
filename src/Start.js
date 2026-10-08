export default class Start extends Phaser.Scene {
    constructor() {
        super({ key: 'Start' });
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.cameras.main.setBackgroundColor('#050509');

        this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x050509
        );

        for (let i = 0; i < 18; i++) {
            this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(1, 3),
                0x555577,
                Phaser.Math.FloatBetween(0.15, 0.45)
            );
        }

        this.add.text(
            width / 2,
            height / 2 - 115,
            'Avron: Magician',
            {
                fontFamily: 'Arial',
                fontSize: '68px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        this.add.text(
            width / 2,
            height / 2 - 35,
            'ACTION PLATFORMER',
            {
                fontFamily: 'Arial',
                fontSize: '21px',
                color: '#9999aa',
                letterSpacing: 3
            }
        ).setOrigin(0.5);

        const buttonBackground = this.add.rectangle(
            width / 2,
            height / 2 + 72,
            310,
            66,
            0x171725
        )
            .setStrokeStyle(2, 0x555577)
            .setInteractive({ useHandCursor: true });

        const startText = this.add.text(
            width / 2,
            height / 2 + 72,
            'ENTER — начать игру',
            {
                fontFamily: 'Arial',
                fontSize: '22px',
                color: '#ffffff'
            }
        )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        const startGame = () => {
            if (this.started) return;

            this.started = true;
            this.scene.start('MainMenuScene');
        };

        this.input.keyboard.on('keydown-ENTER', startGame);
        this.input.keyboard.on('keydown-SPACE', startGame);

        startText.on('pointerdown', startGame);
        buttonBackground.on('pointerdown', startGame);

        startText.on('pointerover', () => {
            buttonBackground.setFillStyle(0x24243a);
        });

        startText.on('pointerout', () => {
            buttonBackground.setFillStyle(0x171725);
        });
    }
}