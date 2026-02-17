[English](./README-EN.md) | **中文**

# 🃏 21点 (Blackjack)

一个使用 React + Vite 构建的21点纸牌游戏。

## ✨ 功能特性

- 🎮 完整的21点游戏逻辑
- 💰 筹码系统（支持本地存储）
- 🔊 音效反馈
- 🎯 支持以下操作：
  - **要牌 (Hit)** - 再抽一张牌
  - **停牌 (Stand)** - 停止要牌
  - **加倍 (Double Down)** - 加倍下注并只抽一张牌
  - **分牌 (Split)** - 将相同点数的牌分成两手
  - **保险 (Insurance)** - 当庄家显示A时购买保险

## 🎲 游戏规则

- 使用6副牌（312张）
- Blackjack赔率 3:2
- 保险赔率 3:1
- 最小下注：10
- 最大下注：500
- 初始筹码：1000
- 庄家必须在17点以下要牌

## 🛠️ 技术栈

- **React 19** - UI框架
- **Vite 8** - 构建工具
- **Vitest** - 单元测试
- **Testing Library** - React组件测试

## 📦 安装与运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview

# 运行测试
pnpm test

# 代码检查
pnpm lint
```

## 📁 项目结构

```
src/
├── App.jsx              # 应用入口组件
├── main.jsx             # React渲染入口
├── components/          # UI组件
│   ├── GameTable.jsx    # 游戏桌面
│   ├── Hand.jsx         # 手牌显示
│   ├── Card.jsx         # 单张牌
│   ├── Controls.jsx     # 游戏控制按钮
│   ├── BettingArea.jsx  # 下注区域
│   └── ChipStack.jsx    # 筹码堆
├── hooks/
│   └── useGameState.js  # 游戏状态管理Hook
├── logic/               # 游戏逻辑
│   ├── deck.js          # 牌组操作
│   ├── rules.js         # 规则判断
│   └── dealer.js        # 庄家逻辑
├── audio/
│   └── sounds.js        # 音效管理
└── styles/
    └── game.css         # 全局样式
```

## 🎮 游戏流程

1. **下注阶段** - 点击筹码选择下注金额
2. **发牌** - 点击"发牌"开始游戏
3. **玩家回合** - 选择要牌、停牌、加倍或分牌
4. **庄家回合** - 庄家按规则自动要牌
5. **结算** - 比较点数，计算输赢

## 📄 许可证

MIT
