/**
 * 配置数据 - 特性定义和全局常量
 */

export const TRAIT_DEFINITIONS = {
    'shield': {
        icon: '🛡️',
        name: '護盾',
        desc: '金屬/晶體外殼',
        modifiers: { scale: 1.3, muscle: 1.5, limbLen: 0.9 },
        forcedSkin: 'chitin',
        tint: [0.6, 0.7, 1.0],
        feature: 'crystal_shoulders'
    },
    'haste': {
        icon: '⚡',
        name: '極速',
        desc: '流線型推進器',
        modifiers: { scale: 0.7, muscle: 0.6, limbLen: 1.6 },
        forcedSkin: 'scale',
        tint: [1.0, 1.0, 0.6],
        feature: 'back_boosters'
    },
    'regen': {
        icon: '💚',
        name: '再生',
        desc: '外露核心',
        modifiers: { scale: 1.1, muscle: 1.0 },
        forcedSkin: 'flesh',
        tint: [0.6, 1.0, 0.6],
        feature: 'exposed_heart'
    },
    'clone': {
        icon: '🦠',
        name: '增殖',
        desc: '寄生頭部',
        modifiers: { scale: 0.6, muscle: 0.8, spineLen: 0.7 },
        forcedSkin: 'flesh',
        tint: [0.9, 0.6, 0.9],
        feature: 'parasite_head'
    },
    'berserk': {
        icon: '😡',
        name: '狂暴',
        desc: '高溫散熱脊',
        modifiers: { scale: 1.2, muscle: 1.8, limbLen: 1.1 },
        forcedSkin: 'rock',
        tint: [1.0, 0.4, 0.4],
        feature: 'heat_vents'
    },
    'healer': {
        icon: '💖',
        name: '治癒',
        desc: '聖潔光環',
        modifiers: { scale: 0.9, muscle: 0.7, spineLen: 1.3 },
        forcedSkin: 'fur',
        tint: [1.0, 0.95, 0.8],
        feature: 'halo'
    },
    'devour': {
        icon: '👅',
        name: '吞噬',
        desc: '腹部巨口',
        modifiers: { scale: 1.5, muscle: 1.2, spineLen: 0.6 },
        forcedSkin: 'flesh',
        tint: [0.8, 0.4, 0.6],
        feature: 'belly_maw'
    },
    'jump': {
        icon: '🦘',
        name: '跳躍',
        desc: '機械腿部',
        modifiers: { limbLen: 1.8, muscle: 1.1 },
        dnaOverride: { legType: 'digitigrade' },
        tint: [0.7, 0.8, 0.9],
        feature: 'leg_hydraulics'
    }
};

export const DEFAULT_PARAMS = {
    seed: 123,
    gravity: 1.0,
    spineLen: 1.0,
    limbLen: 1.0,
    resolution: 50,
    smoothness: 0.4
};
