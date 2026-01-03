/**
 * 特效系统 - 技能和视觉效果
 */

import * as THREE from 'three';

export class SkillEffectSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
    }

    spawn(origin) {
        const count = 16;
        const geom = new THREE.TetrahedronGeometry(0.15);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00ffff });

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(geom, mat);
            mesh.position.copy(origin);

            const theta = (i / count) * Math.PI * 2;
            const dir = new THREE.Vector3(Math.cos(theta), 0, Math.sin(theta)).normalize();
            dir.y = Math.random() * 0.5;

            this.particles.push({ mesh, dir, life: 1.5 });
            this.scene.add(mesh);
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt * 0.8;
            p.mesh.position.add(p.dir.clone().multiplyScalar(dt * 3.0));
            p.mesh.rotation.x += dt * 5;
            p.mesh.rotation.z += dt * 5;
            p.mesh.scale.setScalar(p.life);

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
            }
        }
    }
}
