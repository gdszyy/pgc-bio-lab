/**
 * 通用工具函数
 */

export function log(msg) {
    console.log(msg);
    const c = document.getElementById('debug-console');
    if (c) {
        c.innerHTML += `> ${msg}<br>`;
        c.scrollTop = c.scrollHeight;
    }
}

export function getVertexColor(health) {
    const h = Math.max(0, Math.min(1, health / 100));
    const r = 0.8 + h * 0.2;
    const g = 0.4 + h * 0.4;
    const b = 0.3 + h * 0.3;
    return [r, g, b];
}
