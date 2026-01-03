/**
 * PGC 生物实验室 - 主程序入口
 * ES6 模块化版本
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/controls/OrbitControls.js';

import { TextureFactory } from './graphics/materials.js';
import { generateSkeleton, applyDamage, createBones } from './logic/skeleton.js';
import { generateOptimizedMesh } from './logic/mesher.js';
import { AnimationController } from './animation/controller.js';
import { SkillEffectSystem } from './graphics/effects.js';
import { SpriteBaker } from './graphics/baker.js';
import { TRAIT_DEFINITIONS, DEFAULT_PARAMS } from './config.js';
import { log } from './core/utils.js';

// 全局状态
let scene, camera, renderer, controls, skinnedMesh;
let animController, effectSystem, clock, debounceTimer;
let fullNodesBlueprint = [], currentNodes = [];
let activeTraits = new Set();

function init() {
    // 初始化 Three.js 场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 2, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // 灯光设置
    scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 0.5));
    const spot = new THREE.SpotLight(0xffffff, 1.0);
    spot.position.set(5, 8, 5);
    spot.castShadow = true;
    scene.add(spot);

    // 网格辅助
    scene.add(new THREE.GridHelper(20, 20, 0x555555, 0x333333));

    // 控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.5, 0);

    // 初始化系统
    effectSystem = new SkillEffectSystem(scene);
    TextureFactory.initMaterials();
    animController = new AnimationController();
    clock = new THREE.Clock();

    setupUI();
    generateCreature();
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function setupUI() {
    const traitContainer = document.getElementById('trait-selector');
    Object.keys(TRAIT_DEFINITIONS).forEach(key => {
        const def = TRAIT_DEFINITIONS[key];
        const btn = document.createElement('div');
        btn.className = 'trait-btn';
        btn.setAttribute('data-id', key);
        btn.innerHTML = `${def.icon}<div class="trait-tooltip">${def.name}: ${def.desc}</div>`;
        btn.onclick = () => {
            if (activeTraits.has(key)) {
                activeTraits.delete(key);
            } else {
                activeTraits.add(key);
            }
            btn.classList.toggle('selected');
            generateCreature();
        };
        traitContainer.appendChild(btn);
    });

    const inputs = ['health', 'seed'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', e => {
                const valEl = document.getElementById('val-' + id);
                if (valEl) {
                    valEl.innerText = e.target.value + (id === 'health' ? '%' : '');
                }
                if (id === 'health') {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(updateCreatureState, 50);
                } else {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(generateCreature, 200);
                }
            });
        }
    });

    const genBtn = document.getElementById('btn-generate');
    if (genBtn) {
        genBtn.addEventListener('click', generateCreature);
    }

    // 导出按钮
    const exportBtn = document.getElementById('btn-export-sprite');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (!skinnedMesh) {
                alert("沒有生成生物！");
                return;
            }
            const sizeEl = document.getElementById('sprite-size');
            const size = sizeEl ? parseInt(sizeEl.value) : 128;
            const baker = new SpriteBaker(scene, skinnedMesh, animController);
            let currentAnim = animController.state;
            if (currentAnim === 'skill') currentAnim = 'skill';
            baker.bake(currentAnim, 16, size, 'side');
        });
    }

    // 动画按钮
    ['anim-idle', 'anim-walk', 'anim-hit', 'anim-skill'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                if (id === 'anim-hit') {
                    animController.triggerHit();
                } else if (id === 'anim-skill') {
                    animController.setAnimation('skill');
                } else {
                    animController.setAnimation(id.split('-')[1]);
                }
            });
        }
    });
}

function generateCreature() {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.style.display = 'block';

    setTimeout(() => {
        const getVal = (id, def) => {
            const el = document.getElementById(id);
            return el ? parseFloat(el.value) : def;
        };

        const p = {
            seed: getVal('seed', DEFAULT_PARAMS.seed),
            gravity: DEFAULT_PARAMS.gravity,
            spineLen: DEFAULT_PARAMS.spineLen,
            limbLen: DEFAULT_PARAMS.limbLen,
            resolution: DEFAULT_PARAMS.resolution,
            smoothness: DEFAULT_PARAMS.smoothness
        };

        animController.updateDNA(p.seed);
        fullNodesBlueprint = generateSkeleton(p, activeTraits);
        updateCreatureState();

        if (loadingEl) loadingEl.style.display = 'none';
    }, 10);
}

function updateCreatureState() {
    const healthEl = document.getElementById('health');
    const h = healthEl ? parseFloat(healthEl.value) : 100;
    const p = { resolution: DEFAULT_PARAMS.resolution, smoothness: DEFAULT_PARAMS.smoothness };

    if (skinnedMesh) {
        scene.remove(skinnedMesh);
        skinnedMesh.geometry.dispose();
        if (skinnedMesh.skeleton) skinnedMesh.skeleton.dispose();
    }

    currentNodes = applyDamage(fullNodesBlueprint, h);
    if (currentNodes.length === 0) return;

    const bones = createBones(currentNodes);
    const skeleton = new THREE.Skeleton(bones);
    const geo = generateOptimizedMesh(currentNodes, p, h / 100, {}, {}, TextureFactory);

    if (geo.type === 'BoxGeometry') {
        skinnedMesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }));
        scene.add(skinnedMesh);
        return;
    }

    skinnedMesh = new THREE.SkinnedMesh(geo, TextureFactory.materials);
    skinnedMesh.add(bones[0]);
    bones[0].updateMatrixWorld(true);
    skinnedMesh.bind(skeleton);
    skinnedMesh.frustumCulled = false;
    skinnedMesh.castShadow = true;
    skinnedMesh.receiveShadow = true;
    scene.add(skinnedMesh);

    // 更新统计信息
    const statsEl = document.getElementById('stats');
    if (statsEl) {
        statsEl.innerHTML = `Triangles: ${(geo.attributes.position.count / 3) | 0}<br>Nodes: ${currentNodes.length}`;
    }
}

function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();

    try {
        if (skinnedMesh && skinnedMesh.skeleton) {
            animController.update(skinnedMesh.skeleton, dt, currentNodes, skinnedMesh);
        }
        if (effectSystem) {
            effectSystem.update(dt);
        }
    } catch (e) {
        console.error("Animation error:", e);
    }

    controls.update();
    renderer.render(scene, camera);
}

// 启动应用
init();
