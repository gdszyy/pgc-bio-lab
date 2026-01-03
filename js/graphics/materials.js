/**
 * 材质工厂 - 纹理和材质生成
 */

import * as THREE from 'three';

export class TextureFactory {
    static createNoiseCanvas(width, height, type, colorBase = [255, 255, 255]) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
            const x = (i / 4) % width;
            const y = Math.floor((i / 4) / width);
            let val = 0;

            if (type === 'noise') {
                val = Math.random() * 50 + 200;
            } else if (type === 'scales') {
                const s = 20;
                const d = Math.min(x % s, s - x % s, y % s, s - y % s);
                val = 100 + d * 15 + (Math.random() - 0.5) * 30;
            } else if (type === 'striated') {
                val = 128 + Math.sin(x * 0.2 + (Math.random() * 0.5)) * 40;
            } else if (type === 'keratin') {
                val = 100 + Math.sin(Math.sqrt((x - width / 2) ** 2 + (y - height / 2) ** 2) * 0.5) * 50;
            } else if (type === 'feathers') {
                val = 150 + Math.sin(x * 0.1 + y * 0.2) * 50;
            } else if (type === 'fur') {
                val = 150 + (Math.random() - 0.5) * 100;
                if (x > 0) val = (val + data[i - 4]) * 0.5;
            } else if (type === 'chitin') {
                val = 180;
                if ((x % 40 < 2) || (y % 40 < 2)) val = 50;
            } else if (type === 'crystal') {
                val = 200 + Math.random() * 55;
                if ((x + y) % 20 < 2) val = 100;
            } else if (type === 'eye') {
                const cx = width / 2, cy = height / 2;
                const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                val = Math.max(0, 255 - d * 2);
            }

            data[i] = val * (colorBase[0] / 255);
            data[i + 1] = val * (colorBase[1] / 255);
            data[i + 2] = val * (colorBase[2] / 255);
            data[i + 3] = 255;
        }

        ctx.putImageData(imgData, 0, 0);
        return canvas;
    }

    static createNormalMap(sourceCanvas) {
        const width = sourceCanvas.width;
        const height = sourceCanvas.height;
        const ctx = sourceCanvas.getContext('2d');
        const srcData = ctx.getImageData(0, 0, width, height).data;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const dCtx = canvas.getContext('2d');
        const imgData = dCtx.createImageData(width, height);
        const data = imgData.data;

        const getH = (x, y) => srcData[((y % height) * width + (x % width)) * 4] / 255.0;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = (getH(x - 1, y) - getH(x + 1, y)) * 3.0;
                const dy = (getH(x, y - 1) - getH(x, y + 1)) * 3.0;
                const len = Math.sqrt(dx * dx + dy * dy + 1);
                const i = (y * width + x) * 4;

                data[i] = (dx / len * 0.5 + 0.5) * 255;
                data[i + 1] = (dy / len * 0.5 + 0.5) * 255;
                data[i + 2] = (1 / len * 0.5 + 0.5) * 255;
                data[i + 3] = 255;
            }
        }

        dCtx.putImageData(imgData, 0, 0);
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }

    static materials = [];

    static initMaterials() {
        this.materials = [];

        const textureTypes = ['noise', 'scales', 'striated', 'keratin', 'feathers', 'fur', 'chitin', 'crystal'];
        const colors = [
            [255, 200, 150],
            [100, 180, 100],
            [150, 100, 100],
            [200, 200, 200],
            [180, 150, 100],
            [120, 100, 80],
            [80, 100, 120],
            [200, 150, 100]
        ];

        for (let i = 0; i < textureTypes.length; i++) {
            const canvas = this.createNoiseCanvas(256, 256, textureTypes[i], colors[i]);
            const normalMap = this.createNormalMap(canvas);
            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

            const material = new THREE.MeshPhongMaterial({
                map: texture,
                normalMap: normalMap,
                side: THREE.DoubleSide,
                vertexColors: true,
                shininess: 50
            });

            this.materials.push(material);
        }
    }
}
