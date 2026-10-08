import { getBackgroundData } from '../data/backgrounds.js';

export class BackgroundSystem {

    constructor(scene) {
        this.scene = scene;

        this.root = null;
        this.layers = [];

        this.stageId = null;
        this.created = false;

        this.lastWidth = 0;
        this.lastHeight = 0;

        this.base = null;
    }

    create(stageId) {

        this.destroy();

        this.stageId = stageId;

        const data = getBackgroundData(stageId);

        this.root = this.scene.add.container(0, 0);

        this.root.setScrollFactor(0);
        this.root.setDepth(-1000);

        this.createBase(data);

        this.createLayer('far', data?.far, 0);
        this.createLayer('mid', data?.mid, 1);
        this.createLayer('near', data?.near, 2);

        this.created = true;

        this.resize();
        this.update();

        return this;
    }

    createBase(data) {

        const width = Math.max(
            640,
            Math.floor(this.scene.scale.width)
        );

        const height = Math.max(
            360,
            Math.floor(this.scene.scale.height)
        );

        const color =
            data?.base?.color ??
            0x101018;

        this.base = this.scene.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            color,
            1
        );

        this.base.setScrollFactor(0);
        this.base.setDepth(-1000);

        this.root.add(this.base);
    }

    createLayer(name, config, depthOffset) {

        if (!config?.keys?.length) {
            return;
        }

        const layer = {
            name,
            config,
            container: this.scene.add.container(0, 0),
            images: [],
            panoramaWidth: 0,
            panoramaHeight: 0,
            built: false
        };

        layer.container.setScrollFactor(0);
        layer.container.setDepth(-990 + depthOffset);

        this.root.add(layer.container);

        /*
         * Загружаем именно указанные сегменты.
         *
         * far:
         * 01 → 02 → 03
         *
         * mid:
         * 01 → 02
         *
         * near:
         * 01 → 02
         */

        for (const key of config.keys) {

            if (!this.scene.textures.exists(key)) {
                continue;
            }

            const image = this.scene.add.image(
                0,
                0,
                key
            );

            image.setOrigin(0, 0);
            image.setAlpha(config.alpha ?? 1);
            image.setVisible(false);

            layer.container.add(image);
            layer.images.push(image);
        }

        if (!layer.images.length) {
            layer.container.destroy();
            return;
        }

        /*
         * Считаем натуральный размер всей полосы.
         */

        for (const image of layer.images) {

            layer.panoramaWidth += image.width || 0;

            layer.panoramaHeight = Math.max(
                layer.panoramaHeight,
                image.height || 0
            );
        }

        this.layers.push(layer);
    }

    buildLayer(layer) {

        if (!layer.images.length) {
            return;
        }

        const worldWidth =
            this.scene.CONFIG?.WORLD?.width ??
            14000;

        /*
         * НЕ растягиваем высоту до 1200.
         *
         * Сохраняем исходные пропорции PNG.
         *
         * Вся панорама сначала масштабируется
         * ровно до ширины игрового мира.
         */

        const scale =
            worldWidth / layer.panoramaWidth;

        let x = 0;

        for (const image of layer.images) {

            const displayWidth =
                (image.width || 1) * scale;

            const displayHeight =
                (image.height || 1) * scale;

            image.setDisplaySize(
                displayWidth,
                displayHeight
            );

            image.x = x;

            /*
             * Пока центрируем панораму по экрану.
             * Никакого жёсткого y = 390.
             */

            image.y = 0;

            image.setVisible(true);

            x += displayWidth;
        }

        /*
         * Вся панорама теперь имеет ширину ровно WORLD_WIDTH.
         */

        layer.built = true;
    }

    update() {

        if (!this.created || !this.root) {
            return;
        }

        const camera =
            this.scene.cameras.main;

        if (!camera) {
            return;
        }

        const width = Math.max(
            640,
            Math.floor(this.scene.scale.width)
        );

        const height = Math.max(
            360,
            Math.floor(this.scene.scale.height)
        );

        const cameraX =
            camera.scrollX ?? 0;

        const worldWidth =
            this.scene.CONFIG?.WORLD?.width ??
            14000;

        for (const layer of this.layers) {

            const config = layer.config;

            /*
             * Старый режим первой карты
             * оставляем полностью рабочим.
             */

            if (config.fitScreen) {

                const image = layer.images[0];

                if (!image) {
                    continue;
                }

                image.setDisplaySize(
                    width,
                    height
                );

                image.setPosition(
                    width / 2,
                    height / 2
                );

                image.setVisible(true);

                for (
                    let i = 1;
                    i < layer.images.length;
                    i++
                ) {
                    layer.images[i].setVisible(false);
                }

                continue;
            }

            /*
             * Строим панораму один раз.
             */

            if (!layer.built) {
                this.buildLayer(layer);
            }

            const px =
                config.parallaxX ?? 0.1;

            /*
             * Вот это возвращает старое движение.
             */

            let offsetX =
                -(cameraX * px);

            /*
             * Циклическое движение всей панорамы.
             */

            offsetX =
                offsetX % worldWidth;

            if (offsetX > 0) {
                offsetX -= worldWidth;
            }

            /*
             * Панорама должна закрывать экран.
             *
             * Поэтому нам нужны копии всей панорамы:
             *
             * [копия] [основная] [копия]
             */

            this.positionCopies(
                layer,
                offsetX,
                worldWidth,
                width,
                height
            );
        }
    }

    positionCopies(
        layer,
        offsetX,
        worldWidth,
        screenWidth,
        screenHeight
    ) {

        /*
         * Для простоты используем контейнеры-копии.
         */

        if (!layer.copies) {

            layer.copies = [];

            for (let c = 0; c < 3; c++) {

                const copy =
                    this.scene.add.container(
                        0,
                        0
                    );

                copy.setScrollFactor(0);

                copy.setDepth(
                    layer.container.depth
                );

                this.root.add(copy);

                for (const source of layer.images) {

                    const image =
                        this.scene.add.image(
                            source.x,
                            source.y,
                            source.texture.key
                        );

                    image.setOrigin(0, 0);

                    image.setDisplaySize(
                        source.displayWidth,
                        source.displayHeight
                    );

                    image.setAlpha(
                        source.alpha
                    );

                    copy.add(image);
                }

                layer.copies.push(copy);
            }
        }

        /*
         * Центрируем саму панораму по вертикали.
         *
         * Она сохраняет пропорции.
         */

        const panoramaHeight =
            layer.panoramaHeight *
            (
                worldWidth /
                layer.panoramaWidth
            );

        const y =
            (screenHeight - panoramaHeight) / 2;

        /*
         * Основная панорама.
         */

        layer.container.x =
            offsetX;

        layer.container.y =
            y;

        /*
         * Левая копия.
         */

        layer.copies[0].x =
            offsetX - worldWidth;

        layer.copies[0].y =
            y;

        /*
         * Правая копия.
         */

        layer.copies[1].x =
            offsetX + worldWidth;

        layer.copies[1].y =
            y;

        /*
         * Ещё одна дальняя копия.
         */

        layer.copies[2].x =
            offsetX + worldWidth * 2;

        layer.copies[2].y =
            y;
    }

    resize() {

        if (!this.base) {
            return;
        }

        const width = Math.max(
            640,
            Math.floor(this.scene.scale.width)
        );

        const height = Math.max(
            360,
            Math.floor(this.scene.scale.height)
        );

        this.base.setPosition(
            width / 2,
            height / 2
        );

        this.base.setSize(
            width,
            height
        );

        /*
         * После resize надо пересчитать масштаб
         * и положение панорамы.
         */

        for (const layer of this.layers) {
            layer.built = false;
        }

        this.lastWidth = width;
        this.lastHeight = height;

        this.update();
    }

    setStage(stageId) {

        if (this.stageId === stageId) {
            return;
        }

        this.create(stageId);
    }

    destroy() {

        for (const layer of this.layers) {

            for (const image of layer.images) {
                image.destroy();
            }

            if (layer.copies) {

                for (const copy of layer.copies) {
                    copy.destroy();
                }
            }

            if (layer.container) {
                layer.container.destroy();
            }
        }

        this.layers.length = 0;

        if (this.base) {
            this.base.destroy();
            this.base = null;
        }

        if (this.root) {
            this.root.destroy();
            this.root = null;
        }

        this.created = false;
    }
}

export default BackgroundSystem;