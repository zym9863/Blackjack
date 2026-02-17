# 21点纸牌游戏 - 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现一个功能完整的21点纸牌网页游戏，包含经典赌场风格界面、筹码系统、进阶规则和音效。

**Architecture:** React 组件树管理 UI，useReducer 集中管理游戏状态机（下注→发牌→玩家操作→庄家操作→结算），纯函数处理游戏逻辑（牌组、规则、庄家AI），CSS 动画处理视觉效果，Web Audio API 合成音效。

**Tech Stack:** React 18, Vite, Vitest (测试), CSS Modules, Web Audio API

---

## Task 1: 项目脚手架

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`

**Step 1: 用 Vite 初始化 React 项目**

Run: `cd d:/github/Blackjack && npm create vite@latest . -- --template react`

如果提示目录非空，选择忽略已有文件。

**Step 2: 安装依赖**

Run: `cd d:/github/Blackjack && npm install`

**Step 3: 安装测试框架**

Run: `cd d:/github/Blackjack && npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`

**Step 4: 配置 Vitest**

修改 `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.js',
  },
})
```

创建 `src/test-setup.js`:

```js
import '@testing-library/jest-dom'
```

**Step 5: 验证项目运行**

Run: `cd d:/github/Blackjack && npm run dev` (确认能正常启动)
Run: `cd d:/github/Blackjack && npx vitest run` (确认测试框架正常)

**Step 6: 创建目录结构**

```bash
mkdir -p src/components src/hooks src/logic src/audio src/styles
```

**Step 7: Commit**

```bash
git add -A && git commit -m "chore: scaffold React + Vite project with Vitest"
```

---

## Task 2: 牌组逻辑 (deck.js)

**Files:**
- Create: `src/logic/deck.js`
- Test: `src/logic/__tests__/deck.test.js`

**Step 1: 写失败测试**

```js
// src/logic/__tests__/deck.test.js
import { describe, it, expect } from 'vitest'
import { createDeck, shuffle, dealCard } from '../deck'

describe('createDeck', () => {
  it('should create a deck with 312 cards (6 decks)', () => {
    const deck = createDeck(6)
    expect(deck).toHaveLength(312)
  })

  it('should have correct card structure', () => {
    const deck = createDeck(1)
    expect(deck[0]).toHaveProperty('suit')
    expect(deck[0]).toHaveProperty('rank')
    expect(deck[0]).toHaveProperty('value')
  })

  it('should have 4 suits with 13 ranks each per deck', () => {
    const deck = createDeck(1)
    expect(deck).toHaveLength(52)
    const suits = new Set(deck.map(c => c.suit))
    expect(suits.size).toBe(4)
  })
})

describe('shuffle', () => {
  it('should return a shuffled copy without modifying original', () => {
    const deck = createDeck(1)
    const original = [...deck]
    const shuffled = shuffle(deck)
    expect(deck).toEqual(original) // 原数组未变
    expect(shuffled).toHaveLength(52)
    // 洗牌后不应完全相同（概率极低）
    const same = shuffled.every((card, i) => card === deck[i])
    expect(same).toBe(false)
  })
})

describe('dealCard', () => {
  it('should remove and return the top card', () => {
    const deck = createDeck(1)
    const shuffled = shuffle(deck)
    const topCard = shuffled[0]
    const { card, remaining } = dealCard(shuffled)
    expect(card).toEqual(topCard)
    expect(remaining).toHaveLength(51)
  })

  it('should indicate when deck needs reshuffle (< 25%)', () => {
    const deck = createDeck(6) // 312 cards
    // 模拟只剩 77 张（< 78 = 312 * 0.25）
    const smallDeck = deck.slice(0, 77)
    const { needsReshuffle } = dealCard(smallDeck)
    expect(needsReshuffle).toBe(true)
  })
})
```

**Step 2: 运行测试确认失败**

Run: `npx vitest run src/logic/__tests__/deck.test.js`
Expected: FAIL

**Step 3: 实现 deck.js**

```js
// src/logic/deck.js
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades']
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

function cardValue(rank) {
  if (rank === 'A') return 11
  if (['K', 'Q', 'J'].includes(rank)) return 10
  return parseInt(rank, 10)
}

export function createDeck(numDecks = 6) {
  const deck = []
  for (let d = 0; d < numDecks; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ suit, rank, value: cardValue(rank) })
      }
    }
  }
  return deck
}

export function shuffle(deck) {
  const copy = [...deck]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function dealCard(deck) {
  const [card, ...remaining] = deck
  const totalCards = 312 // 6 decks
  const needsReshuffle = remaining.length < totalCards * 0.25
  return { card, remaining, needsReshuffle }
}
```

**Step 4: 运行测试确认通过**

Run: `npx vitest run src/logic/__tests__/deck.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/logic/ && git commit -m "feat: implement deck creation, shuffle, and deal logic"
```

---

## Task 3: 规则逻辑 (rules.js)

**Files:**
- Create: `src/logic/rules.js`
- Test: `src/logic/__tests__/rules.test.js`

**Step 1: 写失败测试**

```js
// src/logic/__tests__/rules.test.js
import { describe, it, expect } from 'vitest'
import { calculateHandValue, isBlackjack, isBusted, canSplit, canDoubleDown } from '../rules'

const card = (rank, suit = 'hearts') => ({ rank, suit, value: ['A'].includes(rank) ? 11 : ['K','Q','J'].includes(rank) ? 10 : parseInt(rank) })

describe('calculateHandValue', () => {
  it('should sum card values', () => {
    expect(calculateHandValue([card('5'), card('3')])).toBe(8)
  })

  it('should count face cards as 10', () => {
    expect(calculateHandValue([card('K'), card('Q')])).toBe(20)
  })

  it('should count A as 11 when safe', () => {
    expect(calculateHandValue([card('A'), card('9')])).toBe(20)
  })

  it('should count A as 1 when 11 would bust', () => {
    expect(calculateHandValue([card('A'), card('9'), card('5')])).toBe(15)
  })

  it('should handle multiple aces', () => {
    expect(calculateHandValue([card('A'), card('A')])).toBe(12)
    expect(calculateHandValue([card('A'), card('A'), card('A')])).toBe(13)
  })
})

describe('isBlackjack', () => {
  it('should detect A + 10-value as blackjack', () => {
    expect(isBlackjack([card('A'), card('K')])).toBe(true)
    expect(isBlackjack([card('10'), card('A')])).toBe(true)
  })

  it('should not count 3+ cards totaling 21 as blackjack', () => {
    expect(isBlackjack([card('7'), card('7'), card('7')])).toBe(false)
  })
})

describe('isBusted', () => {
  it('should detect bust when over 21', () => {
    expect(isBusted([card('K'), card('Q'), card('5')])).toBe(true)
  })

  it('should not bust at 21 or under', () => {
    expect(isBusted([card('K'), card('Q')])).toBe(false)
  })
})

describe('canSplit', () => {
  it('should allow split with same rank', () => {
    expect(canSplit([card('8'), card('8')])).toBe(true)
  })

  it('should not allow split with different ranks', () => {
    expect(canSplit([card('8'), card('9')])).toBe(false)
  })

  it('should not allow split with more than 2 cards', () => {
    expect(canSplit([card('8'), card('8'), card('3')])).toBe(false)
  })
})

describe('canDoubleDown', () => {
  it('should allow double down with exactly 2 cards', () => {
    expect(canDoubleDown([card('5'), card('6')])).toBe(true)
  })

  it('should not allow double down with 3+ cards', () => {
    expect(canDoubleDown([card('5'), card('6'), card('2')])).toBe(false)
  })
})
```

**Step 2: 运行测试确认失败**

Run: `npx vitest run src/logic/__tests__/rules.test.js`

**Step 3: 实现 rules.js**

```js
// src/logic/rules.js
export function calculateHandValue(hand) {
  let value = 0
  let aces = 0
  for (const card of hand) {
    if (card.rank === 'A') {
      aces++
      value += 11
    } else if (['K', 'Q', 'J'].includes(card.rank)) {
      value += 10
    } else {
      value += parseInt(card.rank, 10)
    }
  }
  while (value > 21 && aces > 0) {
    value -= 10
    aces--
  }
  return value
}

export function isBlackjack(hand) {
  return hand.length === 2 && calculateHandValue(hand) === 21
}

export function isBusted(hand) {
  return calculateHandValue(hand) > 21
}

export function canSplit(hand) {
  return hand.length === 2 && hand[0].rank === hand[1].rank
}

export function canDoubleDown(hand) {
  return hand.length === 2
}
```

**Step 4: 运行测试确认通过**

Run: `npx vitest run src/logic/__tests__/rules.test.js`

**Step 5: Commit**

```bash
git add src/logic/ && git commit -m "feat: implement hand value calculation and game rules"
```

---

## Task 4: 庄家逻辑 (dealer.js)

**Files:**
- Create: `src/logic/dealer.js`
- Test: `src/logic/__tests__/dealer.test.js`

**Step 1: 写失败测试**

```js
// src/logic/__tests__/dealer.test.js
import { describe, it, expect } from 'vitest'
import { shouldDealerHit, playDealerHand } from '../dealer'

const card = (rank, suit = 'hearts') => ({ rank, suit, value: 0 })

describe('shouldDealerHit', () => {
  it('should hit on 16 or less', () => {
    expect(shouldDealerHit([card('10'), card('6')])).toBe(true)
  })

  it('should stand on 17 or more', () => {
    expect(shouldDealerHit([card('10'), card('7')])).toBe(false)
  })

  it('should stand on soft 17 (A + 6)', () => {
    expect(shouldDealerHit([card('A'), card('6')])).toBe(false)
  })
})

describe('playDealerHand', () => {
  it('should draw until 17 or higher', () => {
    const dealerHand = [card('10'), card('4')]
    const deck = [card('2'), card('5'), card('K')]
    const { hand, remainingDeck } = playDealerHand(dealerHand, deck)
    // 10+4=14 → hit 2 → 16 → hit 5 → 21 stop
    expect(hand).toHaveLength(4)
  })
})
```

**Step 2: 运行测试确认失败**

Run: `npx vitest run src/logic/__tests__/dealer.test.js`

**Step 3: 实现 dealer.js**

```js
// src/logic/dealer.js
import { calculateHandValue } from './rules'

export function shouldDealerHit(hand) {
  return calculateHandValue(hand) < 17
}

export function playDealerHand(hand, deck) {
  let currentHand = [...hand]
  let remainingDeck = [...deck]

  while (shouldDealerHit(currentHand)) {
    const [card, ...rest] = remainingDeck
    currentHand.push(card)
    remainingDeck = rest
  }

  return { hand: currentHand, remainingDeck }
}
```

**Step 4: 运行测试确认通过**

Run: `npx vitest run src/logic/__tests__/dealer.test.js`

**Step 5: Commit**

```bash
git add src/logic/ && git commit -m "feat: implement dealer AI logic"
```

---

## Task 5: 游戏状态管理 (useGameState)

**Files:**
- Create: `src/hooks/useGameState.js`
- Test: `src/hooks/__tests__/useGameState.test.js`

**Step 1: 写失败测试**

```js
// src/hooks/__tests__/useGameState.test.js
import { describe, it, expect } from 'vitest'
import { gameReducer, initialState, ACTIONS } from '../useGameState'

describe('gameReducer', () => {
  it('should initialize with correct defaults', () => {
    expect(initialState.phase).toBe('betting')
    expect(initialState.chips).toBe(1000)
    expect(initialState.bet).toBe(0)
    expect(initialState.playerHands).toEqual([[]])
    expect(initialState.dealerHand).toEqual([])
  })

  it('should place a bet', () => {
    const state = gameReducer(initialState, { type: ACTIONS.PLACE_BET, payload: 100 })
    expect(state.bet).toBe(100)
    expect(state.chips).toBe(900)
  })

  it('should not bet more than available chips', () => {
    const state = gameReducer({ ...initialState, chips: 50 }, { type: ACTIONS.PLACE_BET, payload: 100 })
    expect(state.bet).toBe(0)
    expect(state.chips).toBe(50)
  })

  it('should deal initial cards', () => {
    const betState = gameReducer(initialState, { type: ACTIONS.PLACE_BET, payload: 100 })
    const dealtState = gameReducer(betState, { type: ACTIONS.DEAL })
    expect(dealtState.playerHands[0]).toHaveLength(2)
    expect(dealtState.dealerHand).toHaveLength(2)
    expect(dealtState.phase).toBe('playing')
  })

  it('should handle hit action', () => {
    // 构造一个已发牌的状态
    const playingState = {
      ...initialState,
      phase: 'playing',
      bet: 100,
      chips: 900,
      playerHands: [[
        { rank: '5', suit: 'hearts', value: 5 },
        { rank: '3', suit: 'clubs', value: 3 },
      ]],
      activeHandIndex: 0,
      dealerHand: [
        { rank: 'K', suit: 'spades', value: 10 },
        { rank: '7', suit: 'hearts', value: 7 },
      ],
      deck: [{ rank: '4', suit: 'diamonds', value: 4 }, ...Array(100).fill({ rank: '2', suit: 'hearts', value: 2 })],
    }
    const state = gameReducer(playingState, { type: ACTIONS.HIT })
    expect(state.playerHands[0]).toHaveLength(3)
  })

  it('should handle stand action', () => {
    const playingState = {
      ...initialState,
      phase: 'playing',
      bet: 100,
      chips: 900,
      playerHands: [[
        { rank: 'K', suit: 'hearts', value: 10 },
        { rank: '9', suit: 'clubs', value: 9 },
      ]],
      activeHandIndex: 0,
      dealerHand: [
        { rank: '10', suit: 'spades', value: 10 },
        { rank: '7', suit: 'hearts', value: 7 },
      ],
      deck: Array(100).fill({ rank: '2', suit: 'hearts', value: 2 }),
    }
    const state = gameReducer(playingState, { type: ACTIONS.STAND })
    expect(state.phase).toBe('settled')
  })

  it('should handle new round', () => {
    const settledState = {
      ...initialState,
      phase: 'settled',
      chips: 1100,
      bet: 0,
      playerHands: [[{ rank: 'K', suit: 'hearts', value: 10 }, { rank: '9', suit: 'clubs', value: 9 }]],
      dealerHand: [{ rank: '10', suit: 'spades', value: 10 }, { rank: '6', suit: 'hearts', value: 6 }],
      deck: Array(100).fill({ rank: '2', suit: 'hearts', value: 2 }),
    }
    const state = gameReducer(settledState, { type: ACTIONS.NEW_ROUND })
    expect(state.phase).toBe('betting')
    expect(state.bet).toBe(0)
    expect(state.playerHands).toEqual([[]])
    expect(state.dealerHand).toEqual([])
  })
})
```

**Step 2: 运行测试确认失败**

Run: `npx vitest run src/hooks/__tests__/useGameState.test.js`

**Step 3: 实现 useGameState.js**

```js
// src/hooks/useGameState.js
import { useReducer, useEffect } from 'react'
import { createDeck, shuffle, dealCard } from '../logic/deck'
import { calculateHandValue, isBlackjack, isBusted } from '../logic/rules'
import { playDealerHand } from '../logic/dealer'

export const ACTIONS = {
  PLACE_BET: 'PLACE_BET',
  CLEAR_BET: 'CLEAR_BET',
  DEAL: 'DEAL',
  HIT: 'HIT',
  STAND: 'STAND',
  DOUBLE_DOWN: 'DOUBLE_DOWN',
  SPLIT: 'SPLIT',
  INSURANCE: 'INSURANCE',
  DECLINE_INSURANCE: 'DECLINE_INSURANCE',
  NEW_ROUND: 'NEW_ROUND',
  RESET_CHIPS: 'RESET_CHIPS',
}

function loadChips() {
  const saved = localStorage.getItem('blackjack_chips')
  return saved ? parseInt(saved, 10) : 1000
}

export const initialState = {
  deck: shuffle(createDeck(6)),
  playerHands: [[]],
  dealerHand: [],
  activeHandIndex: 0,
  phase: 'betting', // betting | dealing | insurance | playing | dealerTurn | settled
  chips: loadChips(),
  bet: 0,
  bets: [0], // 每手牌的赌注（分牌时多个）
  insuranceBet: 0,
  result: null, // 每手牌的结果数组: ['win', 'lose', 'push', 'blackjack']
  message: '',
}

function ensureDeck(deck) {
  if (deck.length < 312 * 0.25) {
    return shuffle(createDeck(6))
  }
  return deck
}

function settleHand(playerHand, dealerHand) {
  const playerVal = calculateHandValue(playerHand)
  const dealerVal = calculateHandValue(dealerHand)
  const playerBJ = isBlackjack(playerHand)
  const dealerBJ = isBlackjack(dealerHand)

  if (playerBJ && dealerBJ) return 'push'
  if (playerBJ) return 'blackjack'
  if (isBusted(playerHand)) return 'lose'
  if (dealerBJ) return 'lose'
  if (isBusted(dealerHand)) return 'win'
  if (playerVal > dealerVal) return 'win'
  if (playerVal < dealerVal) return 'lose'
  return 'push'
}

function calculatePayout(results, bets, insuranceBet, dealerHand) {
  let payout = 0
  results.forEach((result, i) => {
    const bet = bets[i]
    if (result === 'blackjack') payout += bet + bet * 1.5
    else if (result === 'win') payout += bet * 2
    else if (result === 'push') payout += bet
    // lose = 0
  })
  // 保险结算
  if (insuranceBet > 0 && isBlackjack(dealerHand)) {
    payout += insuranceBet * 3 // 原注 + 2:1 赔付
  }
  return payout
}

export function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.PLACE_BET: {
      const amount = action.payload
      if (amount > state.chips - state.bet) return state
      if (state.bet + amount > 500) return state
      return {
        ...state,
        bet: state.bet + amount,
        chips: state.chips - amount,
      }
    }

    case ACTIONS.CLEAR_BET: {
      return {
        ...state,
        chips: state.chips + state.bet,
        bet: 0,
      }
    }

    case ACTIONS.DEAL: {
      if (state.bet < 10) return state
      let deck = ensureDeck(state.deck)
      const playerCards = []
      const dealerCards = []

      // 交替发牌：玩家、庄家、玩家、庄家
      for (let i = 0; i < 2; i++) {
        let result = dealCard(deck); playerCards.push(result.card); deck = result.remaining
        result = dealCard(deck); dealerCards.push(result.card); deck = result.remaining
      }

      const playerBJ = isBlackjack(playerCards)
      const dealerShowsAce = dealerCards[0].rank === 'A'

      let phase = 'playing'
      if (dealerShowsAce && !playerBJ) phase = 'insurance'
      else if (playerBJ) phase = 'dealerTurn' // 直接进入结算

      return {
        ...state,
        deck,
        playerHands: [playerCards],
        dealerHand: dealerCards,
        activeHandIndex: 0,
        bets: [state.bet],
        phase,
        result: null,
        message: '',
      }
    }

    case ACTIONS.INSURANCE: {
      const insuranceBet = Math.floor(state.bet / 2)
      if (insuranceBet > state.chips) return state
      return {
        ...state,
        chips: state.chips - insuranceBet,
        insuranceBet,
        phase: 'playing',
      }
    }

    case ACTIONS.DECLINE_INSURANCE: {
      return { ...state, phase: 'playing' }
    }

    case ACTIONS.HIT: {
      if (state.phase !== 'playing') return state
      let deck = [...state.deck]
      const { card, remaining } = dealCard(deck)
      const hands = state.playerHands.map((h, i) =>
        i === state.activeHandIndex ? [...h, card] : h
      )

      const currentHand = hands[state.activeHandIndex]
      let phase = 'playing'

      if (isBusted(currentHand)) {
        // 当前手牌爆牌，看是否还有下一手
        if (state.activeHandIndex < hands.length - 1) {
          return {
            ...state,
            deck: remaining,
            playerHands: hands,
            activeHandIndex: state.activeHandIndex + 1,
          }
        }
        phase = 'dealerTurn'
      }

      return {
        ...state,
        deck: remaining,
        playerHands: hands,
        phase,
      }
    }

    case ACTIONS.STAND: {
      if (state.activeHandIndex < state.playerHands.length - 1) {
        return {
          ...state,
          activeHandIndex: state.activeHandIndex + 1,
        }
      }

      // 所有手牌结束，庄家操作
      const allBusted = state.playerHands.every(h => isBusted(h))
      let dealerHand = state.dealerHand
      let deck = state.deck

      if (!allBusted) {
        const result = playDealerHand(dealerHand, deck)
        dealerHand = result.hand
        deck = result.remainingDeck
      }

      const results = state.playerHands.map(h => settleHand(h, dealerHand))
      const payout = calculatePayout(results, state.bets, state.insuranceBet, dealerHand)

      return {
        ...state,
        deck,
        dealerHand,
        phase: 'settled',
        result: results,
        chips: state.chips + payout,
      }
    }

    case ACTIONS.DOUBLE_DOWN: {
      if (state.phase !== 'playing') return state
      const currentBet = state.bets[state.activeHandIndex]
      if (currentBet > state.chips) return state

      let deck = [...state.deck]
      const { card, remaining } = dealCard(deck)
      const hands = state.playerHands.map((h, i) =>
        i === state.activeHandIndex ? [...h, card] : h
      )
      const bets = state.bets.map((b, i) =>
        i === state.activeHandIndex ? b * 2 : b
      )

      // 加倍后自动停牌
      const newState = {
        ...state,
        deck: remaining,
        playerHands: hands,
        bets,
        chips: state.chips - currentBet,
      }

      // 触发 STAND 逻辑
      return gameReducer(newState, { type: ACTIONS.STAND })
    }

    case ACTIONS.SPLIT: {
      if (state.phase !== 'playing') return state
      const hand = state.playerHands[state.activeHandIndex]
      if (hand.length !== 2 || hand[0].rank !== hand[1].rank) return state

      const currentBet = state.bets[state.activeHandIndex]
      if (currentBet > state.chips) return state

      let deck = [...state.deck]

      // 分成两手，各补一张牌
      const hand1 = [hand[0]]
      const hand2 = [hand[1]]

      let result = dealCard(deck); hand1.push(result.card); deck = result.remaining
      result = dealCard(deck); hand2.push(result.card); deck = result.remaining

      const newHands = [...state.playerHands]
      newHands.splice(state.activeHandIndex, 1, hand1, hand2)

      const newBets = [...state.bets]
      newBets.splice(state.activeHandIndex, 1, currentBet, currentBet)

      return {
        ...state,
        deck,
        playerHands: newHands,
        bets: newBets,
        chips: state.chips - currentBet,
        activeHandIndex: state.activeHandIndex,
      }
    }

    case ACTIONS.NEW_ROUND: {
      return {
        ...state,
        playerHands: [[]],
        dealerHand: [],
        activeHandIndex: 0,
        phase: 'betting',
        bet: 0,
        bets: [0],
        insuranceBet: 0,
        result: null,
        message: '',
        deck: ensureDeck(state.deck),
      }
    }

    case ACTIONS.RESET_CHIPS: {
      return { ...state, chips: 1000 }
    }

    default:
      return state
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  // 持久化筹码
  useEffect(() => {
    localStorage.setItem('blackjack_chips', state.chips.toString())
  }, [state.chips])

  // dealerTurn 自动结算
  useEffect(() => {
    if (state.phase === 'dealerTurn') {
      const allBusted = state.playerHands.every(h => isBusted(h))
      let dealerHand = state.dealerHand
      let deck = state.deck

      if (!allBusted) {
        const result = playDealerHand(dealerHand, deck)
        dealerHand = result.hand
        deck = result.remainingDeck
      }

      const results = state.playerHands.map(h => settleHand(h, dealerHand))
      const payout = calculatePayout(results, state.bets, state.insuranceBet, dealerHand)

      // 延迟一下让动画播放
      setTimeout(() => {
        dispatch({
          type: '__SETTLE',
          payload: { dealerHand, deck, results, payout },
        })
      }, 500)
    }
  }, [state.phase])

  return { state, dispatch, ACTIONS }
}
```

注意：需要在 reducer 中额外处理 `__SETTLE` action:

在 `gameReducer` 的 switch 中添加:

```js
case '__SETTLE': {
  const { dealerHand, deck, results, payout } = action.payload
  return {
    ...state,
    deck,
    dealerHand,
    phase: 'settled',
    result: results,
    chips: state.chips + payout,
  }
}
```

**Step 4: 运行测试确认通过**

Run: `npx vitest run src/hooks/__tests__/useGameState.test.js`

**Step 5: Commit**

```bash
git add src/hooks/ && git commit -m "feat: implement game state reducer with all actions"
```

---

## Task 6: 音效系统 (sounds.js)

**Files:**
- Create: `src/audio/sounds.js`

**Step 1: 实现 Web Audio API 合成音效**

```js
// src/audio/sounds.js
let audioCtx = null

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioCtx
}

function playTone(frequency, duration, type = 'sine', volume = 0.3) {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, ctx.currentTime)
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + duration)
}

function playNoise(duration, volume = 0.15) {
  const ctx = getCtx()
  const bufferSize = ctx.sampleRate * duration
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 3000
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start()
  source.stop(ctx.currentTime + duration)
}

export const sounds = {
  dealCard() {
    playNoise(0.08, 0.2)
  },

  chipPlace() {
    playTone(800, 0.05, 'square', 0.1)
    setTimeout(() => playTone(1200, 0.03, 'square', 0.08), 30)
  },

  win() {
    playTone(523, 0.15, 'sine', 0.25)
    setTimeout(() => playTone(659, 0.15, 'sine', 0.25), 100)
    setTimeout(() => playTone(784, 0.3, 'sine', 0.25), 200)
  },

  lose() {
    playTone(400, 0.2, 'sine', 0.2)
    setTimeout(() => playTone(300, 0.3, 'sine', 0.2), 150)
  },

  blackjack() {
    playTone(523, 0.1, 'sine', 0.3)
    setTimeout(() => playTone(659, 0.1, 'sine', 0.3), 80)
    setTimeout(() => playTone(784, 0.1, 'sine', 0.3), 160)
    setTimeout(() => playTone(1047, 0.4, 'sine', 0.3), 240)
  },

  bust() {
    playTone(200, 0.3, 'sawtooth', 0.15)
  },

  flip() {
    playNoise(0.05, 0.15)
    playTone(600, 0.05, 'sine', 0.1)
  },
}
```

**Step 2: Commit**

```bash
git add src/audio/ && git commit -m "feat: implement synthesized sound effects with Web Audio API"
```

---

## Task 7: Card 组件

**Files:**
- Create: `src/components/Card.jsx`
- Create: `src/components/Card.module.css`

**Step 1: 实现 Card 组件**

Card.jsx 用纯 CSS 绘制纸牌：正面显示花色和点数，背面显示菱形图案。支持翻转动画（faceDown prop）和发牌入场动画（dealDelay prop 控制延迟）。

Card.module.css 包含：
- 卡牌尺寸（80x112px）
- 3D 翻转效果（perspective + rotateY）
- 白底圆角阴影
- 红色/黑色花色
- 发牌滑入 keyframe（从右侧进入）
- 蓝色菱形背面图案

**Step 2: Commit**

```bash
git add src/components/Card.* && git commit -m "feat: implement Card component with CSS flip animation"
```

---

## Task 8: Hand 组件

**Files:**
- Create: `src/components/Hand.jsx`
- Create: `src/components/Hand.module.css`

**Step 1: 实现 Hand 组件**

Hand.jsx 渲染一手牌（Card 数组），带点数显示标签。props 包含 cards, label（"玩家"/"庄家"), isDealer（控制第二张牌是否隐藏），isActive（高亮当前操作手）。

卡牌堆叠偏移布局：每张牌向右偏移 30px。

**Step 2: Commit**

```bash
git add src/components/Hand.* && git commit -m "feat: implement Hand component with stacked card layout"
```

---

## Task 9: 筹码与下注组件

**Files:**
- Create: `src/components/ChipStack.jsx`
- Create: `src/components/ChipStack.module.css`
- Create: `src/components/BettingArea.jsx`
- Create: `src/components/BettingArea.module.css`

**Step 1: 实现 ChipStack 组件**

ChipStack.jsx 渲染单个筹码（圆形 + 条纹 + 面值文字）。颜色映射：5=红(#e74c3c), 25=绿(#27ae60), 100=黑(#2c3e50), 500=紫(#8e44ad)。

**Step 2: 实现 BettingArea 组件**

BettingArea.jsx 包含：可点击的筹码选择器（4种面值）、当前赌注显示、清除按钮、发牌按钮。筹码点击时触发 PLACE_BET action。

**Step 3: Commit**

```bash
git add src/components/Chip* src/components/Betting* && git commit -m "feat: implement chip and betting area components"
```

---

## Task 10: 操作按钮组件

**Files:**
- Create: `src/components/Controls.jsx`
- Create: `src/components/Controls.module.css`

**Step 1: 实现 Controls 组件**

Controls.jsx 根据游戏阶段渲染不同按钮：
- `playing` 阶段：要牌 (Hit)、停牌 (Stand)、条件性显示加倍 (Double) 和分牌 (Split)
- `insurance` 阶段：买保险、拒绝保险
- `settled` 阶段：新一局
- `betting` 阶段：不显示（由 BettingArea 处理）

按钮样式：金色边框 (#d4a574)、深色背景 (#1a1a2e)、悬停发光效果。

**Step 2: Commit**

```bash
git add src/components/Controls.* && git commit -m "feat: implement game control buttons"
```

---

## Task 11: GameTable 主界面组件

**Files:**
- Create: `src/components/GameTable.jsx`
- Create: `src/components/GameTable.module.css`

**Step 1: 实现 GameTable 组件**

GameTable.jsx 是主界面容器，组合所有子组件：
- 顶部：筹码余额显示
- 上方：庄家手牌 (Hand)
- 中间：结果消息 + 赌注显示
- 下方：玩家手牌（支持多手，分牌时并排显示）
- 底部：操作按钮 (Controls) 或 下注区 (BettingArea)

GameTable.module.css：
- 深绿渐变背景 + 桌布纹理（CSS repeating-linear-gradient 模拟）
- 圆角椭圆牌桌形状
- 金色边缘装饰

**Step 2: Commit**

```bash
git add src/components/GameTable.* && git commit -m "feat: implement main game table layout"
```

---

## Task 12: 全局样式与 App 整合

**Files:**
- Create: `src/styles/game.css`
- Modify: `src/App.jsx`
- Modify: `src/main.jsx`
- Delete: `src/App.css`, `src/index.css`（Vite 默认生成的）

**Step 1: 创建全局样式**

game.css：
- CSS reset
- 深色背景 body (#0a0a1a)
- 全局字体：Georgia, serif
- 金色/白色配色变量

**Step 2: 修改 App.jsx**

```jsx
import { GameTable } from './components/GameTable'
import { useGameState } from './hooks/useGameState'

function App() {
  const { state, dispatch, ACTIONS } = useGameState()
  return <GameTable state={state} dispatch={dispatch} ACTIONS={ACTIONS} />
}

export default App
```

**Step 3: 验证整体运行**

Run: `npm run dev` 并在浏览器中打开查看效果

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: integrate all components into working game"
```

---

## Task 13: 动画增强

**Files:**
- Modify: `src/components/Card.module.css`
- Modify: `src/components/ChipStack.module.css`
- Modify: `src/components/GameTable.module.css`

**Step 1: 添加发牌动画**

Card.module.css：添加 `@keyframes slideIn` 从牌堆位置（右上）滑到目标位置，配合 `animation-delay` 实现逐张发牌效果。

**Step 2: 添加筹码动画**

ChipStack.module.css：下注时筹码从底部滑入中间区域，结算时赢的筹码飞回余额区。

**Step 3: 添加结算闪光**

GameTable.module.css：胜利时金色脉冲 glow 动画，Blackjack 时更强烈的闪光。

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add deal, chip, and settlement animations"
```

---

## Task 14: 音效集成

**Files:**
- Modify: `src/hooks/useGameState.js`
- Modify: `src/components/BettingArea.jsx`
- Modify: `src/components/Controls.jsx`

**Step 1: 在合适的交互点触发音效**

- 发牌：DEAL action 后触发 `sounds.dealCard()`（每张牌延迟播放）
- 下注：筹码点击时触发 `sounds.chipPlace()`
- 翻牌：庄家翻暗牌时触发 `sounds.flip()`
- 结算：根据结果播放 `sounds.win()` / `sounds.lose()` / `sounds.blackjack()` / `sounds.bust()`

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: integrate sound effects into game actions"
```

---

## Task 15: 响应式布局

**Files:**
- Modify: `src/styles/game.css`
- Modify: `src/components/GameTable.module.css`
- Modify: `src/components/Card.module.css`

**Step 1: 添加媒体查询**

- `@media (max-width: 768px)`：纵向布局，卡牌缩小到 60x84px，按钮放大到 48px 高度，筹码选择器改为 2x2 网格
- `@media (max-width: 480px)`：进一步紧凑布局

**Step 2: 在浏览器中验证**

用浏览器开发者工具切换不同视口宽度测试。

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add responsive layout for mobile devices"
```

---

## Task 16: 最终测试与修复

**Step 1: 运行全部测试**

Run: `npx vitest run`

**Step 2: 在浏览器中完整测试游戏流程**

测试清单：
- [ ] 下注 → 发牌 → 要牌 → 停牌 → 结算 正常流程
- [ ] Blackjack 检测和 3:2 赔付
- [ ] 爆牌检测
- [ ] 分牌流程
- [ ] 加倍下注流程
- [ ] 保险流程
- [ ] 筹码归零后重新领取
- [ ] 刷新后筹码保留
- [ ] 动画和音效正常触发
- [ ] 移动端布局正常

**Step 3: 修复发现的问题**

**Step 4: Final Commit**

```bash
git add -A && git commit -m "fix: final polish and bug fixes"
```

---

**总计 16 个 Task，预估含测试编写。**
