/**
 * 动画控制器 - 骨骼动画和状态管理
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

export class AnimationController {
    constructor() {
        this.state = 'idle';
        this.time = 0;
        this.hitTrauma = 0;
        this.skillTimer = 0;
        this.dna = {};
    }

    updateDNA(seed) {
        this.dna = {
            speed: 1.0,
            breathRate: 1.0,
            sway: 1.0,
            phaseOffset: 0.0
        };
    }

    setAnimation(name) {
        this.state = name;
        if (name === 'skill') {
            this.skillTimer = 0;
            this.hasFired = false;
        }
    }

    triggerHit() {
        this.hitTrauma = 1.0;
    }

    update(skeleton, dt, nodes, mesh) {
        this.time += dt;
        const effTime = this.time;
        this.hitTrauma = Math.max(0, this.hitTrauma - dt * 2.0);

        const bones = skeleton.bones;
        let emissiveColor = 0x000000;

        for (let i = 0; i < bones.length; i++) {
            const bone = bones[i];
            const node = nodes[i];

            bone.rotation.set(0, 0, 0);

            if (node && node.parentIndex === -1) {
                bone.position.copy(node.start);
            }

            if (this.state === 'skill') {
                this.skillTimer += dt * 0.3;

                if (this.skillTimer < 1.0) {
                    const t = this.skillTimer;
                    bone.rotation.x = Math.sin(t * Math.PI) * 0.5;
                    bone.rotation.z = Math.cos(t * Math.PI * 2) * 0.3;
                    emissiveColor = 0x00ffff;
                }
            } else if (this.state === 'walk') {
                const speed = (this.dna.speed || 1.0) * 8.0;
                const phase = (effTime * speed + (this.dna.phaseOffset || 0)) % (Math.PI * 2);

                if (node && node.isLeg) {
                    bone.rotation.x = Math.sin(phase) * 0.6 * node.side;
                } else if (node && node.isArm) {
                    bone.rotation.x = Math.sin(phase + Math.PI) * 0.4;
                }
            } else if (this.state === 'idle') {
                const breathPhase = effTime * (this.dna.breathRate || 1.0);
                const sway = (this.dna.sway || 0.5) * 0.1;

                if (node && node.type === 'spine') {
                    bone.rotation.z = Math.sin(breathPhase) * sway;
                }
            }

            if (this.hitTrauma > 0) {
                const trauma = this.hitTrauma * 0.3;
                bone.rotation.x += (Math.random() - 0.5) * trauma;
                bone.rotation.y += (Math.random() - 0.5) * trauma;
                bone.rotation.z += (Math.random() - 0.5) * trauma;
            }
        }

        if (mesh && mesh.material) {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(m => {
                    m.emissive.setHex(emissiveColor);
                });
            } else {
                mesh.material.emissive.setHex(emissiveColor);
            }
        }
    }
}
