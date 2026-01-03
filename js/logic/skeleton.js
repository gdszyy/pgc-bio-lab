/**
 * 骨骼生成逻辑 - 生物结构的核心算法
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { PseudoRandom } from '../core/math.js';
import { resolveDNA, getMaterialMapping, applyTraitModifiers } from './dna.js';
import { log } from '../core/utils.js';

export class SkeletonNode {
    constructor(id, name, start, end, radius, type, parentIndex = -1) {
        this.id = id;
        this.name = name;
        this.start = start.clone();
        this.end = end.clone();
        this.radius = radius;
        this.type = type;
        this.parentIndex = parentIndex;
        this.isLeg = name.includes('leg');
        this.isArm = name.includes('arm');
        this.side = name.includes('Left') ? -1 : (name.includes('Right') ? 1 : 0);
        this.chainIndex = 0;
        this.durability = 0.0;
        this.originalRadius = radius;
        this.radiusEnd = radius;
        this.isWing = false;
        this.isScorpion = false;
        this.matIndex = -1;
    }
}

export function generateSkeleton(params, activeTraits) {
    const rng = new PseudoRandom(params.seed);
    const nodes = [];
    const dna = resolveDNA(params, activeTraits);
    const matGenes = getMaterialMapping(dna.skinType);
    const modifiers = applyTraitModifiers(params, activeTraits);

    // 生成头部
    const headStart = new THREE.Vector3(0, 2.0, 0);
    const headEnd = new THREE.Vector3(0, 2.5, 0);
    const headNode = new SkeletonNode(0, 'head', headStart, headEnd, 0.4 * modifiers.scale, 'head', -1);
    nodes.push(headNode);

    // 生成脊椎
    const spineCount = Math.floor(dna.spineCount * modifiers.scale);
    let prevNode = headNode;
    for (let i = 0; i < spineCount; i++) {
        const t = i / spineCount;
        const spineStart = new THREE.Vector3(0, 2.0 - t * 1.5, 0);
        const spineEnd = new THREE.Vector3(0, 1.5 - t * 1.5, 0);
        const radius = 0.3 * (1.0 - t * 0.5) * modifiers.muscle;
        const spineNode = new SkeletonNode(nodes.length, `spine_${i}`, spineStart, spineEnd, radius, 'spine', nodes.length - 1);
        spineNode.chainIndex = i;
        nodes.push(spineNode);
        prevNode = spineNode;
    }

    // 生成肢体（腿和手臂）
    const limbCount = Math.floor(dna.limbCount * modifiers.scale);
    for (let i = 0; i < limbCount; i++) {
        const isLeg = i < 2;
        const side = i % 2 === 0 ? 1 : -1;
        const baseY = isLeg ? 0.5 : 1.5;
        const limbStart = new THREE.Vector3(side * 0.6, baseY, 0);
        const limbEnd = new THREE.Vector3(side * 0.8, baseY - 0.8 * modifiers.limbLen, 0);
        const radius = 0.2 * modifiers.muscle;
        const limbName = isLeg ? `leg_${side > 0 ? 'Right' : 'Left'}` : `arm_${side > 0 ? 'Right' : 'Left'}`;
        const limbNode = new SkeletonNode(nodes.length, limbName, limbStart, limbEnd, radius, isLeg ? 'leg' : 'arm', 1);
        limbNode.isLeg = isLeg;
        limbNode.isArm = !isLeg;
        limbNode.side = side;
        nodes.push(limbNode);
    }

    log(`Skeleton generated with ${nodes.length} nodes.`);
    return nodes;
}

export function createBones(nodes) {
    const bones = [];
    nodes.forEach(node => {
        const b = new THREE.Bone();
        b.name = node.name;
        bones.push(b);
    });

    nodes.forEach((node, i) => {
        const bone = bones[i];
        if (node.parentIndex === -1) {
            bone.position.copy(node.start);
        } else {
            bones[node.parentIndex].add(bone);
            bone.position.subVectors(node.start, nodes[node.parentIndex].start);
        }
    });

    return bones;
}

export function applyDamage(fullNodes, healthPercentage) {
    const h = Math.max(0, Math.min(1, healthPercentage / 100));
    const damagedNodes = [];

    for (let i = 0; i < fullNodes.length; i++) {
        const original = fullNodes[i];
        const damaged = new SkeletonNode(
            original.id,
            original.name,
            original.start.clone(),
            original.end.clone(),
            original.radius * h,
            original.type,
            original.parentIndex
        );

        Object.assign(damaged, {
            isLeg: original.isLeg,
            isArm: original.isArm,
            side: original.side,
            chainIndex: original.chainIndex,
            durability: original.durability,
            originalRadius: original.originalRadius,
            radiusEnd: original.radiusEnd * h,
            isWing: original.isWing,
            isScorpion: original.isScorpion,
            matIndex: original.matIndex
        });

        damagedNodes.push(damaged);
    }

    return damagedNodes;
}
