import { CharacterSystem } from '../system/CharacterSystem.js';

export default class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectScene' });
    }

    preload() {
        const frames = [
            ['ingor_idle_1', 'assets/player/Ingor/ingor_walk_1.png'],
            ['ingor_idle_2', 'assets/player/Ingor/ingor_walk_2.png'],
            ['ingor_walk_1', 'assets/player/Ingor/ingor_walk_1.png'],
            ['ingor_walk_2', 'assets/player/Ingor/ingor_walk_2.png'],
            ['criac_idle_1', 'assets/player/Criac/criac_idle_1.png'],
            ['criac_idle_2', 'assets/player/Criac/criac_idle_2.png']
        ];
        for (const [key, path] of frames) {
            if (!this.textures.exists(key)) this.load.image(key, path);
        }
    }

    init(data) {
        this.mode = data?.mode || 'adventure';
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;
        this.cameras.main.setBackgroundColor('#08080d');

        this.add.text(w / 2, 70, 'ВЫБОР ПЕРСОНАЖА', {
            fontFamily: 'Arial', fontSize: '42px', color: '#ffffff', fontStyle: 'bold',
            stroke: '#11111c', strokeThickness: 6
        }).setOrigin(0.5);

        const characters = CharacterSystem.all();
        this.cards = [];
        this.cardIndex = 0;

        const gap = Math.min(360, Math.max(300, w / Math.max(2, characters.length + 0.4)));
        const startX = w / 2 - ((characters.length - 1) * gap) / 2;
        characters.forEach((character, index) => this.createCharacterCard(startX + index * gap, h / 2, character));

        this.add.text(w / 2, h - 45, '← → — выбор     ENTER — выбрать     ESC — назад', {
            fontFamily: 'Arial', fontSize: '18px', color: '#aeb7d9', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.input.keyboard.on('keydown-LEFT', () => this.setSelection(this.cardIndex - 1));
        this.input.keyboard.on('keydown-RIGHT', () => this.setSelection(this.cardIndex + 1));
        this.input.keyboard.on('keydown-UP', () => this.setSelection(this.cardIndex - 1));
        this.input.keyboard.on('keydown-DOWN', () => this.setSelection(this.cardIndex + 1));
        this.input.keyboard.on('keydown-ENTER', () => this.cards[this.cardIndex]?.select());
        this.input.keyboard.on('keydown-ESC', () => this.scene.start('GameModeScene'));
        this.setSelection(0);
    }

    createCharacterCard(x, y, character) {
        const bg = this.add.rectangle(x, y, 290, 380, 0x11111c, 0.96)
            .setStrokeStyle(2, 0x555577)
            .setInteractive({ useHandCursor: true });

        const textureKey = character.visual?.idle1;
        const fallback = character.visual?.idle2 ?? character.visual?.fallback;
        const actualTexture = this.textures.exists(textureKey)
            ? textureKey
            : (this.textures.exists(fallback) ? fallback : null);

        let sprite = null;
        if (actualTexture) {
            sprite = this.add.image(x, y - 75, actualTexture).setDisplaySize(
                Math.min(character.stats.visualWidth ?? 82, 82),
                Math.min(character.stats.visualHeight ?? 108, 108)
            );
            if (character.visual?.tint && character.visual.tint !== 0xffffff) sprite.setTint(character.visual.tint);
        } else {
            sprite = this.add.rectangle(x, y - 75, 96, 128, 0x303044, 1);
        }

        this.add.text(x, y + 20, character.name, {
            fontFamily: 'Arial', fontSize: '30px', color: '#ffffff', fontStyle: 'bold',
            stroke: '#11111c', strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(x, y + 66, character.description, {
            fontFamily: 'Arial', fontSize: '14px', color: '#aeb7d9', align: 'center',
            wordWrap: { width: 245 }
        }).setOrigin(0.5);

        const sigils = character.sigils?.initial ?? [];
        this.add.text(x, y + 125, `HP ${character.stats.maxHP}   SPEED ${character.stats.speed}`, {
            fontFamily: 'Arial', fontSize: '14px', color: '#8edcff', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(x, y + 157, sigils.map(id => id.toUpperCase()).join('  •  '), {
            fontFamily: 'Arial', fontSize: '12px', color: '#d9d8ff', fontStyle: 'bold'
        }).setOrigin(0.5);

        const selectCharacter = () => {
            CharacterSystem.select(this, character.id);
            this.scene.start(
                this.mode === 'tutorial' ? 'TutorialScene' : 'StageSelectScene',
                { characterId: character.id, mode: this.mode }
            );
        };

        bg.on('pointerdown', selectCharacter);
        if (sprite.setInteractive) sprite.setInteractive({ useHandCursor: true }).on('pointerdown', selectCharacter);
        this.cards.push({ bg, sprite, select: selectCharacter });
    }

    setSelection(index) {
        if (!this.cards?.length) return;
        this.cardIndex = Phaser.Math.Wrap(index, 0, this.cards.length);
        this.cards.forEach((card, i) => card.bg.setStrokeStyle(3, i === this.cardIndex ? 0x9ba2c2 : 0x555577));
    }
}
