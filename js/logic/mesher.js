/**
 * 网格/体素生成算法 - 最复杂的渲染逻辑
 */

import * as THREE from 'three';
import { FastSDF } from '../core/math.js';
import { log, getVertexColor } from '../core/utils.js';

export function generateOptimizedMesh(nodes, params, health, currentDNA, matGenes, textureFactory) {
    const startTime = performance.now();
    const resolution = params.resolution || 50;
    const smoothness = params.smoothness || 0.4;

    // 计算包围盒
    let minB = new THREE.Vector3(Infinity, Infinity, Infinity);
    let maxB = new THREE.Vector3(-Infinity, -Infinity, -Infinity);

    for (const node of nodes) {
        minB.min(node.start);
        minB.min(node.end);
        maxB.max(node.start);
        maxB.max(node.end);
    }

    minB.addScalar(-0.5);
    maxB.addScalar(0.5);

    const voxelSize = Math.max(
        (maxB.x - minB.x) / resolution,
        (maxB.y - minB.y) / resolution,
        (maxB.z - minB.z) / resolution
    );

    const dimX = Math.ceil((maxB.x - minB.x) / voxelSize);
    const dimY = Math.ceil((maxB.y - minB.y) / voxelSize);
    const dimZ = Math.ceil((maxB.z - minB.z) / voxelSize);

    const voxelData = new Uint8Array(dimX * dimY * dimZ);
    const boneCache = new Float32Array(nodes.length * 8);
    const smoothCache = new Float32Array(nodes.length);
    const k = smoothness;

    // 缓存骨骼数据
    for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (isNaN(n.start.x) || isNaN(n.radius)) {
            console.error("Found NaN node", n);
        }

        boneCache[i * 8 + 0] = n.start.x;
        boneCache[i * 8 + 1] = n.start.y;
        boneCache[i * 8 + 2] = n.start.z;
        boneCache[i * 8 + 3] = n.end.x;
        boneCache[i * 8 + 4] = n.end.y;
        boneCache[i * 8 + 5] = n.end.z;
        boneCache[i * 8 + 6] = n.radius || 0.05;
        boneCache[i * 8 + 7] = (n.radiusEnd !== undefined ? n.radiusEnd : n.radius) || 0.05;

        if (n.type === 'head' || n.type === 'eye' || n.type === 'decoration' || n.chainIndex >= 2) {
            smoothCache[i] = k * 0.3;
        } else {
            smoothCache[i] = k;
        }
    }

    // 体素化
    let activeVoxels = 0;
    for (let z = 0; z < dimZ; z++) {
        const pz = minB.z + z * voxelSize + voxelSize / 2;
        for (let y = 0; y < dimY; y++) {
            const py = minB.y + y * voxelSize + voxelSize / 2;
            for (let x = 0; x < dimX; x++) {
                const px = minB.x + x * voxelSize + voxelSize / 2;
                let globalDist = 100.0, minDist = 100.0, closestBoneIdx = -1;

                for (let i = 0; i < nodes.length; i++) {
                    const off = i * 8;
                    let dist = FastSDF.taperedSegment(
                        px, py, pz,
                        boneCache[off], boneCache[off + 1], boneCache[off + 2],
                        boneCache[off + 3], boneCache[off + 4], boneCache[off + 5],
                        boneCache[off + 6], boneCache[off + 7]
                    );

                    dist += FastSDF.noise(px, py, pz);
                    const localK = smoothCache[i];

                    if (i === 0) {
                        globalDist = dist;
                    } else {
                        globalDist = FastSDF.smin(globalDist, dist, localK);
                    }

                    if (dist < minDist) {
                        minDist = dist;
                        closestBoneIdx = i;
                    }
                }

                const idx = x + y * dimX + z * dimX * dimY;
                if (globalDist < 0) {
                    voxelData[idx] = closestBoneIdx + 1;
                    activeVoxels++;
                }
            }
        }
    }

    log(`Active voxels: ${activeVoxels}`);

    if (activeVoxels === 0) {
        log("WARN: No active voxels found. Generating debug cube.");
        const cubeGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        return cubeGeo;
    }

    // 生成网格
    const buckets = [];
    for (let m = 0; m < (textureFactory?.materials?.length || 1); m++) {
        buckets.push([]);
    }

    const r = voxelSize / 2;
    const vertColor = getVertexColor(health * 100);
    const uvScale = 0.5;

    const getMaterialIndex = (node) => {
        return Math.floor(Math.random() * (textureFactory?.materials?.length || 1));
    };

    const pushFace = (cx, cy, cz, dir, boneIdx) => {
        let c;
        let uvs = [];

        if (dir === 0) {
            c = [5, 1, 3, 7];
            uvs = [(cz + r) * uvScale, (cy - r) * uvScale, (cz - r) * uvScale, (cy - r) * uvScale, (cz - r) * uvScale, (cy + r) * uvScale, (cz + r) * uvScale, (cy + r) * uvScale];
        }
        if (dir === 1) {
            c = [0, 4, 6, 2];
            uvs = [(cz - r) * uvScale, (cy - r) * uvScale, (cz + r) * uvScale, (cy - r) * uvScale, (cz + r) * uvScale, (cy + r) * uvScale, (cz - r) * uvScale, (cy + r) * uvScale];
        }
        if (dir === 2) {
            c = [6, 7, 3, 2];
            uvs = [(cx - r) * uvScale, (cz + r) * uvScale, (cx + r) * uvScale, (cz + r) * uvScale, (cx + r) * uvScale, (cz - r) * uvScale, (cx - r) * uvScale, (cz - r) * uvScale];
        }
        if (dir === 3) {
            c = [0, 1, 5, 4];
            uvs = [(cx - r) * uvScale, (cz - r) * uvScale, (cx + r) * uvScale, (cz - r) * uvScale, (cx + r) * uvScale, (cz + r) * uvScale, (cx - r) * uvScale, (cz + r) * uvScale];
        }
        if (dir === 4) {
            c = [4, 5, 7, 6];
            uvs = [(cx - r) * uvScale, (cy - r) * uvScale, (cx + r) * uvScale, (cy - r) * uvScale, (cx + r) * uvScale, (cy + r) * uvScale, (cx - r) * uvScale, (cy + r) * uvScale];
        }
        if (dir === 5) {
            c = [1, 0, 2, 3];
            uvs = [(cx + r) * uvScale, (cy - r) * uvScale, (cx - r) * uvScale, (cy - r) * uvScale, (cx - r) * uvScale, (cy + r) * uvScale, (cx + r) * uvScale, (cy + r) * uvScale];
        }

        const heightGradient = Math.max(0.5, Math.min(1.0, (cy + 2.0) / 4.0));
        const matIdx = getMaterialIndex(nodes[boneIdx]);
        const targetList = buckets[matIdx];
        const indices = [0, 1, 2, 0, 2, 3];

        for (let i of indices) {
            const vIdx = c[i];
            const vx = (vIdx & 1) ? r : -r;
            const vy = (vIdx & 2) ? r : -r;
            const vz = (vIdx & 4) ? r : -r;
            targetList.push(
                cx + vx, cy + vy, cz + vz,
                vertColor[0] * heightGradient, vertColor[1] * heightGradient, vertColor[2] * heightGradient,
                boneIdx, uvs[i * 2], uvs[i * 2 + 1]
            );
        }
    };

    const strideY = dimX;
    const strideZ = dimX * dimY;

    for (let z = 1; z < dimZ - 1; z++) {
        for (let y = 1; y < dimY - 1; y++) {
            for (let x = 1; x < dimX - 1; x++) {
                const i = x + y * strideY + z * strideZ;
                const val = voxelData[i];

                if (val > 0) {
                    const boneIdx = val - 1;
                    const cx = minB.x + x * voxelSize + r;
                    const cy = minB.y + y * voxelSize + r;
                    const cz = minB.z + z * voxelSize + r;

                    if (voxelData[i + 1] === 0) pushFace(cx, cy, cz, 0, boneIdx);
                    if (voxelData[i - 1] === 0) pushFace(cx, cy, cz, 1, boneIdx);
                    if (voxelData[i + strideY] === 0) pushFace(cx, cy, cz, 2, boneIdx);
                    if (voxelData[i - strideY] === 0) pushFace(cx, cy, cz, 3, boneIdx);
                    if (voxelData[i + strideZ] === 0) pushFace(cx, cy, cz, 4, boneIdx);
                    if (voxelData[i - strideZ] === 0) pushFace(cx, cy, cz, 5, boneIdx);
                }
            }
        }
    }

    const geom = new THREE.BufferGeometry();
    const finalVerts = [], finalColors = [], finalSkinInd = [], finalSkinW = [], finalUVs = [];
    let offset = 0;

    for (let m = 0; m < buckets.length; m++) {
        const bucket = buckets[m];
        const count = bucket.length / 9;

        if (count > 0) {
            geom.addGroup(offset, count, m);
            for (let k = 0; k < bucket.length; k += 9) {
                finalVerts.push(bucket[k], bucket[k + 1], bucket[k + 2]);
                finalColors.push(bucket[k + 3], bucket[k + 4], bucket[k + 5]);
                finalSkinInd.push(bucket[k + 6], 0, 0, 0);
                finalSkinW.push(1, 0, 0, 0);
                finalUVs.push(bucket[k + 7], bucket[k + 8]);
            }
            offset += count;
        }
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(finalVerts, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(finalColors, 3));
    geom.setAttribute('skinIndex', new THREE.Float32BufferAttribute(finalSkinInd, 4));
    geom.setAttribute('skinWeight', new THREE.Float32BufferAttribute(finalSkinW, 4));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(finalUVs, 2));
    geom.computeVertexNormals();
    geom.computeBoundingBox();
    geom.computeBoundingSphere();

    log(`Geometry generated with ${finalVerts.length / 3} vertices in ${(performance.now() - startTime).toFixed(2)}ms`);
    return geom;
}
