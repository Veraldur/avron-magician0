export class MinimapSystem {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.width = options.width ?? 250;
        this.height = options.height ?? 96;
        this.margin = options.margin ?? 18;
        this.updateInterval = options.updateInterval ?? 80;
        this.lastUpdate = 0;
        this.positionX = null;
        this.positionY = null;

        this.root = null;
        this.background = null;
        this.border = null;
        this.platformGraphics = null;
        this.enemyGraphics = null;
        this.playerGraphics = null;

        this.create();
    }

    create() {
        this.root = this.scene.add.container(0, 0)
            .setScrollFactor(0)
            .setDepth(1000);

        this.background = this.scene.add.rectangle(
            0, 0, this.width, this.height, 0x090b10, 0.78
        ).setOrigin(0, 0);

        this.border = this.scene.add.rectangle(
            0, 0, this.width, this.height, 0xffffff, 0
        ).setOrigin(0, 0).setStrokeStyle(1, 0xffffff, 0.28);

        this.platformGraphics = this.scene.add.graphics();
        this.enemyGraphics = this.scene.add.graphics();
        this.playerGraphics = this.scene.add.graphics();

        this.root.add([
            this.background,
            this.platformGraphics,
            this.enemyGraphics,
            this.playerGraphics,
            this.border
        ]);

        this.layout();
    }

    layout() {
        if (!this.root) return;
        const width = Math.max(640, Math.floor(this.scene.scale.width));
        this.root.setPosition(
            this.positionX ?? (width - this.width - this.margin),
            this.positionY ?? this.margin
        );
    }

    setPosition(x, y) {
        this.positionX = x;
        this.positionY = y;
        this.layout();
    }

    update(time = 0) {
        if (!this.root) return;
        if (time - this.lastUpdate < this.updateInterval) return;

        this.lastUpdate = time;
        this.layout();

        const platforms =
            this.scene.worldSystem?.levelPlatforms ??
            this.scene.levelPlatforms ??
            [];

        const player = this.scene.playerBody;
        const enemies = this.scene.enemies?.getChildren?.() ?? [];

        const worldWidth =
            this.scene.worldWidth ??
            this.scene.CONFIG?.WORLD?.width ??
            14000;

        const worldHeight =
            this.scene.worldHeight ??
            this.scene.CONFIG?.WORLD?.height ??
            1200;

        const scaleX = this.width / worldWidth;
        const scaleY = this.height / worldHeight;

        this.platformGraphics.clear();
        this.enemyGraphics.clear();
        this.playerGraphics.clear();

        this.platformGraphics.fillStyle(0xffffff, 0.48);

        for (const platform of platforms) {
            if (!platform) continue;

            const x = platform.x ?? 0;
            const y = platform.surfaceY ?? platform.y ?? 0;
            const w = platform.width ?? 100;
            const h = Math.max(
                2,
                Math.min(8, (platform.height ?? 24) * scaleY)
            );

            this.platformGraphics.fillRect(
                x * scaleX,
                y * scaleY,
                Math.max(2, w * scaleX),
                h
            );
        }

        for (const enemy of enemies) {
            if (!enemy?.active) continue;

            const x = enemy.x ?? 0;
            const y = enemy.y ?? 0;
            const isBoss = Boolean(enemy.enemyData?.boss || enemy.isBoss);

            this.enemyGraphics.fillStyle(
                isBoss ? 0xff4d5f : 0xffb04d,
                0.95
            );

            this.enemyGraphics.fillCircle(
                x * scaleX,
                y * scaleY,
                isBoss ? 4 : 2.2
            );
        }

        if (player?.active) {
            const x = player.x ?? 0;
            const y = player.y ?? 0;

            this.playerGraphics.fillStyle(0xffffff, 1);
            this.playerGraphics.fillCircle(
                x * scaleX,
                y * scaleY,
                3.5
            );

            const direction = player.facing ?? 1;
            this.playerGraphics.lineStyle(2, 0xffffff, 0.9);
            this.playerGraphics.beginPath();
            this.playerGraphics.moveTo(x * scaleX, y * scaleY);
            this.playerGraphics.lineTo(
                x * scaleX + direction * 7,
                y * scaleY
            );
            this.playerGraphics.strokePath();
        }
    }

    destroy() {
        this.root?.destroy();
        this.root = null;
        this.background = null;
        this.border = null;
        this.platformGraphics = null;
        this.enemyGraphics = null;
        this.playerGraphics = null;
    }
}

export default MinimapSystem;
