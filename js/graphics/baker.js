/**
 * 精灵烘焙系统 - 将 3D 动画导出为 2D 精灵序列
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

export class SpriteBaker {
    constructor(scene, skinnedMesh, animController) {
        this.scene = scene;
        this.mesh = skinnedMesh;
        this.animController = animController;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    bake(animationName, frameCount = 16, size = 128, angle = 'side') {
        const originalState = this.animController.state;
        const aspect = 1;
        const frustumSize = 2.5;

        const bakeCamera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2, frustumSize * aspect / 2,
            frustumSize / 2, frustumSize / -2,
            0.1, 100
        );

        if (angle === 'side') {
            bakeCamera.position.set(0, 0.8, 5);
        }
        bakeCamera.lookAt(0, 0.8, 0);

        const bakerRenderer = new THREE.WebGLRenderer({
            alpha: true,
            preserveDrawingBuffer: true,
            antialias: false
        });

        bakerRenderer.setSize(size, size);
        bakerRenderer.setClearColor(0x000000, 0);

        this.canvas.width = size * frameCount;
        this.canvas.height = size;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.animController.setAnimation(animationName);
        this.animController.time = 0;

        let totalDuration = 1.0;
        if (animationName === 'walk') {
            const speed = 8.0 * (this.animController.dna.speed || 1.0);
            totalDuration = (Math.PI * 2) / speed;
        }

        const dt = totalDuration / frameCount;

        for (let i = 0; i < frameCount; i++) {
            this.animController.update(this.mesh.skeleton, dt, [], this.mesh);
            bakerRenderer.render(this.scene, bakeCamera);
            this.ctx.drawImage(bakerRenderer.domElement, i * size, 0, size, size);
        }

        const dataURL = this.canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = `pgc_${animationName}.png`;
        a.click();

        this.animController.state = originalState;
        bakerRenderer.dispose();
    }
}
