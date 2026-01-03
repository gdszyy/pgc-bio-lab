/**
 * 核心数学工具库 - 与 Three.js 无关的纯算法
 */

export class PseudoRandom {
    constructor(seed) {
        this.seed = seed;
    }

    random() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    range(min, max) {
        return min + this.random() * (max - min);
    }

    choose(arr) {
        return arr[Math.floor(this.random() * arr.length)];
    }
}

export const FastSDF = {
    /**
     * 计算点到锥形线段的有向距离
     */
    taperedSegment: (px, py, pz, ax, ay, az, bx, by, bz, r1, r2) => {
        const pax = px - ax, pay = py - ay, paz = pz - az;
        const bax = bx - ax, bay = by - ay, baz = bz - az;
        const lenSq = bax * bax + bay * bay + baz * baz;

        if (lenSq < 1e-6) {
            return Math.sqrt(pax * pax + pay * pay + paz * paz) - r1;
        }

        const h = Math.max(0, Math.min(1, (pax * bax + pay * bay + paz * baz) / lenSq));
        const dx = pax - bax * h, dy = pay - bay * h, dz = paz - baz * h;
        return Math.sqrt(dx * dx + dy * dy + dz * dz) - (r1 * (1.0 - h) + r2 * h);
    },

    /**
     * 平滑最小值 - 用于融合多个 SDF
     */
    smin: (a, b, k) => {
        const h = Math.max(k - Math.abs(a - b), 0.0) / k;
        return Math.min(a, b) - h * h * k * 0.25;
    },

    /**
     * 3D 噪声函数
     */
    noise: (x, y, z) => Math.sin(x * 8) * Math.cos(y * 8) * Math.sin(z * 8) * 0.03
};
