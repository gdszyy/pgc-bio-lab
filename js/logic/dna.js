/**
 * DNA 解析逻辑 - 基因到表型的映射
 */

import { PseudoRandom } from '../core/math.js';
import { TRAIT_DEFINITIONS } from '../config.js';

export function resolveDNA(params, activeTraits) {
    const rng = new PseudoRandom(params.seed);
    const dna = {
        seed: params.seed,
        speed: rng.range(0.8, 1.2),
        breathRate: rng.range(0.5, 1.5),
        sway: rng.range(0.3, 0.8),
        phaseOffset: rng.range(0, Math.PI * 2),
        skinType: rng.choose(['flesh', 'scale', 'fur', 'chitin', 'rock']),
        legType: rng.choose(['digitigrade', 'plantigrade']),
        spineCount: Math.floor(rng.range(3, 8)),
        limbCount: Math.floor(rng.range(2, 6))
    };

    // 应用特性修饰符
    for (const traitKey of activeTraits) {
        const trait = TRAIT_DEFINITIONS[traitKey];
        if (!trait) continue;

        if (trait.forcedSkin) dna.skinType = trait.forcedSkin;
        if (trait.dnaOverride) Object.assign(dna, trait.dnaOverride);
    }

    return dna;
}

export function getMaterialMapping(skinType) {
    const mapping = {
        'flesh': { baseColor: [0.8, 0.6, 0.5], roughness: 0.7 },
        'scale': { baseColor: [0.4, 0.7, 0.5], roughness: 0.5 },
        'fur': { baseColor: [0.5, 0.4, 0.3], roughness: 0.9 },
        'chitin': { baseColor: [0.3, 0.3, 0.4], roughness: 0.4 },
        'rock': { baseColor: [0.5, 0.5, 0.5], roughness: 0.8 }
    };
    return mapping[skinType] || mapping['flesh'];
}

export function applyTraitModifiers(params, activeTraits) {
    let modifiers = {
        scale: 1.0,
        muscle: 1.0,
        limbLen: 1.0,
        spineLen: 1.0
    };

    for (const traitKey of activeTraits) {
        const trait = TRAIT_DEFINITIONS[traitKey];
        if (!trait || !trait.modifiers) continue;

        for (const [key, value] of Object.entries(trait.modifiers)) {
            if (modifiers.hasOwnProperty(key)) {
                modifiers[key] *= value;
            }
        }
    }

    return modifiers;
}
