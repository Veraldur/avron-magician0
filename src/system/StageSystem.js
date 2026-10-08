import { STAGES, getStageData } from '../data/stages.js';

/**
 * StageSystem отвечает только за перевод declarative stage data
 * в вызовы WorldSystem.
 *
 * Здесь НЕТ собственной физики.
 * WorldSystem знает, как создать collider.
 * Stage data знает, где стоит объект и какой у него visual.
 */
export class StageSystem {
    static count() {
        return STAGES.length;
    }

    static data(index) {
        return getStageData(index);
    }

    static build(world) {
        world.stageSpawnPoints.length = 0;

        for (let stageIndex = 0; stageIndex < STAGES.length; stageIndex++) {
            const data = getStageData(stageIndex);
            const left = world.stageStart(stageIndex);
            const right = world.stageEnd(stageIndex);
            const worldHeight = world.scene.worldHeight;
            const platformHeight = world.scene.CONFIG.PLATFORM.height;

            // Дно/дорога — обычный тот же physics primitive,
            // просто с другим visual и isGround=true.
            world.addStaticPlatform({
                x: (left + right) / 2,
                y: worldHeight - 28,
                width: right - left + 12,
                height: 56,
                stageIndex,
                rowIndex: -1,
                isGround: true,
                texture: data.ground.texture,
                displayWidth: right - left + 12,
                displayHeight: data.ground.displayHeight,
                displayOrigin: { x: 0.5, y: 1 },
                depth: data.ground.depth ?? 10,
                oneWay: false,
                surfaceInset: data.ground.surfaceInset ?? 0
            });

            for (let rowIndex = 0; rowIndex < data.upperPlatforms.length; rowIndex++) {
                const item = data.upperPlatforms[rowIndex];
                const x = left + item.x;
                const height = item.physics?.height ?? platformHeight;
                const width = item.physics?.width ?? item.width * 0.92;

                world.addStaticPlatform({
                    x,
                    y: item.y,
                    width,
                    height,
                    stageIndex,
                    rowIndex,
                    isGround: false,
                    texture: item.texture,
                    displayWidth: item.width,
                    displayHeight: item.height,
                    displayOrigin: item.origin ?? { x: 0.5, y: 0.5 },
                    depth: item.depth ?? 10,
                    oneWay: item.physics?.oneWay ?? true,
                    surfaceInset: item.physics?.surfaceInset ?? 18
                });
            }

            world.stageSpawnPoints[stageIndex] = data.spawns.map(point => ({
                ...point,
                x: left + point.x
            }));
        }
    }
}
