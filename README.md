# 🧬 PGC 生物實驗室 (模組化版)

一個基於 Three.js 的低多邊形生物程序生成系統，使用 ES6 模組化架構，易於維護和擴展。

## 🎯 功能特性

- **程序生成生物**: 基於 DNA 系統的隨機生物生成
- **基因特性系統**: 8 種可組合的特性修飾符（護盾、極速、再生等）
- **骨骼動畫**: 完整的骨骼系統和多種動作（待機、行走、受擊、技能）
- **體素網格化**: 高效的 SDF 體素化算法生成複雜幾何體
- **材質系統**: 8 種程序生成的紋理類型
- **2D 精灵導出**: 將 3D 動畫導出為 2D 精灵序列
- **特效系統**: 技能釋放視覺效果

## 📁 項目結構

```
pgc-bio-lab/
├── index.html              # 入口 HTML
├── css/
│   └── style.css           # 樣式表
├── js/
│   ├── main.js             # 主程式入口
│   ├── config.js           # 配置數據（特性定義）
│   ├── core/
│   │   ├── math.js         # 數學工具（PseudoRandom, FastSDF）
│   │   └── utils.js        # 通用工具（Logger）
│   ├── graphics/
│   │   ├── materials.js    # 材質工廠
│   │   ├── effects.js      # 特效系統
│   │   └── baker.js        # 2D 精灵烘焙
│   ├── logic/
│   │   ├── dna.js          # DNA 解析邏輯
│   │   ├── skeleton.js     # 骨骼生成算法
│   │   └── mesher.js       # 體素/網格生成
│   └── animation/
│       └── controller.js   # 動畫控制器
├── server.js               # Node.js 靜態服務器
├── package.json            # 項目配置
├── railway.json            # Railway 部署配置
└── README.md               # 本文件
```

## 🚀 快速開始

### 本地開發

1. **克隆項目**
   ```bash
   git clone <repository-url>
   cd pgc-bio-lab
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **啟動開發服務器**
   ```bash
   npm start
   ```
   
   訪問 `http://localhost:3000`

### Railway 部署

1. **連接 GitHub 倉庫**
   - 在 Railway 中新建項目
   - 選擇 "Deploy from GitHub"
   - 授權並選擇此倉庫

2. **自動部署**
   - Railway 會自動檢測 `railway.json` 配置
   - 自動構建並啟動服務

3. **訪問應用**
   - Railway 會分配一個公開 URL
   - 直接訪問即可使用

## 🎮 使用指南

### UI 控制

- **基因突變**: 點擊圖標選擇特性組合
- **生命完整度**: 調整滑塊改變生物大小和顏色
- **隨機數種子**: 改變種子生成不同的生物
- **重新生成**: 點擊按鈕生成新生物

### 動作預覽

- **待機**: 呼吸動畫
- **行走**: 循環行走動畫
- **受擊**: 受傷反應
- **釋放技能**: 技能特效

### 2D 導出

- 選擇導出尺寸（64x64、128x128、256x256）
- 點擊"導出當前動作序列幀"
- 自動下載 PNG 精灵表

## 🔧 模組說明

### `config.js`
定義所有特性的屬性和修飾符。

### `core/math.js`
- `PseudoRandom`: 確定性隨機數生成器
- `FastSDF`: 有向距離場算法（體素化核心）

### `logic/skeleton.js`
- `SkeletonNode`: 骨骼節點類
- `generateSkeleton()`: 生成骨骼結構
- `createBones()`: 創建 Three.js 骨骼
- `applyDamage()`: 應用傷害效果

### `logic/mesher.js`
- `generateOptimizedMesh()`: 體素化和網格生成（最複雜的算法）

### `graphics/materials.js`
- `TextureFactory`: 程序生成紋理和材質

### `animation/controller.js`
- `AnimationController`: 骨骼動畫狀態管理

## 🛠️ 開發建議

### 添加新特性
1. 在 `config.js` 中定義特性
2. 在 `skeleton.js` 中應用修飾符
3. 可選：在 `mesher.js` 中添加視覺效果

### 優化性能
- `mesher.js` 可移至 Web Worker（已預留接口）
- 調整 `resolution` 參數平衡質量和速度
- 使用 `smoothness` 參數控制融合強度

### 擴展功能
- 在 `graphics/` 添加新的視覺效果
- 在 `animation/` 添加新動作
- 在 `logic/` 添加新的生成算法

## 📦 依賴

- **Three.js 0.128.0**: 3D 圖形庫（CDN 加載）
- **Node.js**: 服務器運行環境

## 🌐 瀏覽器支持

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 許可證

MIT License

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 🎨 特性示例

### 護盾 (Shield)
- 金屬/晶體外殼
- 修飾符: 體型 +30%, 肌肉 +50%, 肢體長度 -10%

### 極速 (Haste)
- 流線型推進器
- 修飾符: 體型 -30%, 肌肉 -40%, 肢體長度 +60%

### 再生 (Regen)
- 外露核心
- 修飾符: 體型 +10%, 肌肉 +0%

### 狂暴 (Berserk)
- 高溫散熱脊
- 修飾符: 體型 +20%, 肌肉 +80%, 肢體長度 +10%

## 📚 技術棧

- **前端框架**: Three.js
- **模組系統**: ES6 Modules (ESM)
- **服務器**: Node.js + 原生 HTTP
- **部署**: Railway
- **版本控制**: Git

## 🐛 已知問題

- 某些低端設備上體素化可能較慢
- 精灵烘焙在大尺寸下可能消耗較多內存

## 🔮 未來計劃

- [ ] WebGL 2.0 支持
- [ ] 多線程體素化（Web Worker）
- [ ] 實時編輯器
- [ ] 生物保存/加載系統
- [ ] 多人協作編輯
- [ ] 移動端優化

---

**開發者**: PGC Team  
**最後更新**: 2024  
**版本**: 2.0.0
