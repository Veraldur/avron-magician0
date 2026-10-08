export class DialogueSystem {
    constructor(scene) {
        this.scene = scene;
        this.active = false;
        this.lines = [];
        this.index = 0;
        this.charIndex = 0;
        this.timer = null;
        this.onComplete = null;
        this.root = null;
        this.backdrop = null;
        this.tokenFrame = null;
        this.token = null;
        this.speaker = null;
        this.text = null;
        this.hint = null;
        this.speed = 24;
    }

    createUI() {
        if (this.root) return;
        const scene = this.scene;
        this.root = scene.add.container(scene.scale.width / 2, scene.scale.height - 155)
            .setScrollFactor(0)
            .setDepth(1000)
            .setVisible(false);

        this.backdrop = scene.textures.exists('ui_echo_frame')
            ? scene.add.image(0, 0, 'ui_echo_frame').setDisplaySize(1060, 220).setAlpha(0.90)
            : scene.add.rectangle(0, 0, 1060, 220, 0x070812, 0.96).setStrokeStyle(2, 0x777da0, 0.9);

        this.tokenFrame = scene.add.rectangle(0, 18, 118, 154, 0x090b16, 0.42)
            .setStrokeStyle(2, 0x8d96bc, 0.9);
        this.token = scene.add.image(0, 84, 'enemy')
            .setDisplaySize(72, 104)
            .setOrigin(0.5, 1);

        this.speaker = scene.add.text(0, -78, '', {
            fontFamily: 'Arial', fontSize: '22px', color: '#d8ddff', fontStyle: 'bold',
            stroke: '#070812', strokeThickness: 7
        });

        this.text = scene.add.text(0, -38, '', {
            fontFamily: 'Arial', fontSize: '24px', color: '#ffffff',
            wordWrap: { width: 690 }, lineSpacing: 8,
            stroke: '#070812', strokeThickness: 6
        });

        this.hint = scene.add.text(470, 76, 'ENTER — далее', {
            fontFamily: 'Arial', fontSize: '15px', color: '#b7c0df', fontStyle: 'bold'
        }).setOrigin(1, 0.5);

        this.root.add([this.backdrop, this.tokenFrame, this.token, this.speaker, this.text, this.hint]);
        scene.scale.on('resize', this.resize, this);
    }

    start(lines, options = {}) {
        if (!Array.isArray(lines) || !lines.length) return false;
        this.createUI();
        this.lines = lines.map(line => ({
            speaker: line.speaker ?? '...',
            role: line.role ?? null,
            text: String(line.text ?? '')
        }));
        this.index = 0;
        this.charIndex = 0;
        this.onComplete = options.onComplete ?? null;
        this.speed = options.speed ?? 24;
        this.active = true;
        this.scene.dialogueActive = true;
        this.scene.isPaused = true;
        this.scene.physics.world.pause();
        this.scene.pauseSystem?.hide?.();
        this.scene.recipePanel?.setVisible(false);
        this.scene.stageCompletePanel?.setVisible(false);
        this.root.setVisible(true);
        this.showLine();
        return true;
    }

    showLine() {
        const line = this.lines[this.index];
        if (!line) return this.finish();

        const heroId = this.scene.characterId;
        const heroName = this.scene.characterData?.name ?? 'Криак';
        const isHero = line.role === 'hero' || (!line.role && String(line.speaker).trim() === heroName);
        const sideX = isHero ? -405 : 405;

        this.charIndex = 0;
        this.speaker.setText(line.speaker).setPosition(sideX, -78).setOrigin(isHero ? 0 : 1);
        this.text.setPosition(isHero ? -330 : 330, -38).setOrigin(isHero ? 0 : 1);
        this.tokenFrame.setPosition(sideX, 18);
        this.token.setPosition(sideX, 84).setFlipX(!isHero);

        const heroTexture = this.scene.characterData?.visual?.idle1
            ?? this.scene.characterData?.visual?.walk2
            ?? 'criac_idle_1';
        const tokenKey = isHero ? heroTexture : 'enemy';
        if (this.scene.textures.exists(tokenKey)) {
            this.token.setTexture(tokenKey).setDisplaySize(72, 104).setVisible(true);
        } else {
            this.token.setVisible(false);
        }

        this.text.setText('');
        this.typeNextCharacter();
    }

    typeNextCharacter() {
        if (!this.active) return;
        const line = this.lines[this.index];
        if (!line) return this.finish();
        if (this.charIndex >= line.text.length) {
            this.hint.setText('ENTER — далее');
            return;
        }
        this.charIndex += 1;
        this.text.setText(line.text.slice(0, this.charIndex));
        this.hint.setText('ENTER — далее');
        this.timer = this.scene.time.delayedCall(1000 / this.speed, () => this.typeNextCharacter());
    }

    advance() {
        if (!this.active) return false;
        const line = this.lines[this.index];
        if (!line) return false;
        if (this.charIndex < line.text.length) {
            this.timer?.remove?.(false);
            this.timer = null;
            this.charIndex = line.text.length;
            this.text.setText(line.text);
            return true;
        }
        this.index += 1;
        if (this.index >= this.lines.length) this.finish();
        else this.showLine();
        return true;
    }

    finish() {
        this.timer?.remove?.(false);
        this.timer = null;
        this.active = false;
        this.root?.setVisible(false);
        this.scene.dialogueActive = false;
        const callback = this.onComplete;
        this.onComplete = null;
        callback?.();
        if (!this.scene.stageCompletePanel?.visible && !this.scene.gameOver && this.scene?.sys?.isActive?.()) {
            this.scene.isPaused = false;
            this.scene.physics.world.resume();
        }
    }

    resize() {
        if (!this.root) return;
        this.root.setPosition(this.scene.scale.width / 2, this.scene.scale.height - 155);
    }

    destroy() {
        this.timer?.remove?.(false);
        this.timer = null;
        this.scene?.scale?.off?.('resize', this.resize, this);
        this.root?.destroy();
        this.root = null;
        this.scene = null;
    }
}

export default DialogueSystem;
