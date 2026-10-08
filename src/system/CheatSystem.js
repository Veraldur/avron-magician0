export class CheatSystem {
    constructor(scene) {
        this.scene = scene;
        this.enabled = true;
        this.lastUse = 0;
    }

    handleKey(event) {
        if (!this.enabled || !event || this.scene?.gameOver && event.code !== 'F1') return;

        switch (event.code) {
            case 'F1':
                this.scene.gems = Math.max(this.scene.gems ?? 0, 100);
                this.scene.updateUI?.();
                this.scene.showArenaMessage?.('ЧИТ: 100 ГЕМОВ');
                break;
            case 'F2':
                this.scene.playerHP = this.scene.player?.stats?.maxHP ?? this.scene.CONFIG.PLAYER.maxHP;
                this.scene.updateHPUI?.();
                this.scene.showArenaMessage?.('ЧИТ: ПОЛНОЕ HP');
                break;
            case 'F3':
                if (this.scene.superSystem) {
                    this.scene.superSystem.meter = this.scene.CONFIG.SUPER?.meterMax ?? 100;
                    this.scene.updateUI?.();
                    this.scene.showArenaMessage?.('ЧИТ: SUPER ГОТОВ');
                }
                break;
            case 'F4':
                this.killAllEnemies();
                break;
            case 'F5':
                this.nextStage();
                break;
            case 'F6':
                this.scene.gems = (this.scene.gems ?? 0) + 500;
                this.scene.updateUI?.();
                this.scene.showArenaMessage?.('ЧИТ: +500 ГЕМОВ');
                break;
            default:
                return;
        }
    }

    killAllEnemies() {
        const enemies = this.scene.enemies?.getChildren?.() ?? [];
        for (const enemy of enemies) {
            if (enemy?.active && enemy.stageIndex === this.scene.currentStageIndex) {
                this.scene.killEnemy?.(enemy);
            }
        }
        this.scene.showArenaMessage?.('ЧИТ: ВРАГИ УНИЧТОЖЕНЫ');
    }

    nextStage() {
        const next = (this.scene.selectedStageIndex ?? 0) + 1;
        if (next > 1) {
            this.scene.showArenaMessage?.('ЧИТ: ЭТО ПОСЛЕДНЯЯ СТАДИЯ');
            return;
        }
        this.scene.scene.restart({
            stageIndex: next,
            characterId: this.scene.characterId
        });
    }
}

export default CheatSystem;
