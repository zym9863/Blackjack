import { describe, it, expect, beforeEach } from 'vitest'
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

  it('should accumulate bets', () => {
    let state = gameReducer(initialState, { type: ACTIONS.PLACE_BET, payload: 100 })
    state = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: 25 })
    expect(state.bet).toBe(125)
    expect(state.chips).toBe(875)
  })

  it('should not bet more than available chips', () => {
    const state = gameReducer({ ...initialState, chips: 50 }, { type: ACTIONS.PLACE_BET, payload: 100 })
    expect(state.bet).toBe(0)
    expect(state.chips).toBe(50)
  })

  it('should not exceed max bet of 500', () => {
    let state = gameReducer(initialState, { type: ACTIONS.PLACE_BET, payload: 500 })
    state = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: 5 })
    expect(state.bet).toBe(500)
    expect(state.chips).toBe(500)
  })

  it('should clear bet', () => {
    let state = gameReducer(initialState, { type: ACTIONS.PLACE_BET, payload: 100 })
    state = gameReducer(state, { type: ACTIONS.CLEAR_BET })
    expect(state.bet).toBe(0)
    expect(state.chips).toBe(1000)
  })

  it('should deal initial cards', () => {
    const betState = gameReducer(initialState, { type: ACTIONS.PLACE_BET, payload: 100 })
    const dealtState = gameReducer(betState, { type: ACTIONS.DEAL })
    expect(dealtState.playerHands[0]).toHaveLength(2)
    expect(dealtState.dealerHand).toHaveLength(2)
    expect(['playing', 'insurance', 'dealerTurn']).toContain(dealtState.phase)
  })

  it('should not deal with bet below minimum (10)', () => {
    const betState = gameReducer(initialState, { type: ACTIONS.PLACE_BET, payload: 5 })
    const dealtState = gameReducer(betState, { type: ACTIONS.DEAL })
    expect(dealtState.playerHands[0]).toHaveLength(0) // no cards dealt
  })

  it('should handle hit action', () => {
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
      bets: [100],
      dealerHand: [
        { rank: 'K', suit: 'spades', value: 10 },
        { rank: '7', suit: 'hearts', value: 7 },
      ],
      deck: [{ rank: '4', suit: 'diamonds', value: 4 }, ...Array(100).fill({ rank: '2', suit: 'hearts', value: 2 })],
    }
    const state = gameReducer(playingState, { type: ACTIONS.HIT })
    expect(state.playerHands[0]).toHaveLength(3)
  })

  it('should auto-bust on hit when over 21', () => {
    const playingState = {
      ...initialState,
      phase: 'playing',
      bet: 100,
      chips: 900,
      bets: [100],
      playerHands: [[
        { rank: 'K', suit: 'hearts', value: 10 },
        { rank: 'Q', suit: 'clubs', value: 10 },
      ]],
      activeHandIndex: 0,
      dealerHand: [
        { rank: '10', suit: 'spades', value: 10 },
        { rank: '7', suit: 'hearts', value: 7 },
      ],
      deck: [{ rank: 'K', suit: 'diamonds', value: 10 }, ...Array(100).fill({ rank: '2', suit: 'hearts', value: 2 })],
    }
    const state = gameReducer(playingState, { type: ACTIONS.HIT })
    expect(state.playerHands[0]).toHaveLength(3)
    // single hand busted → goes to dealerTurn
    expect(state.phase).toBe('dealerTurn')
  })

  it('should handle stand action and settle', () => {
    const playingState = {
      ...initialState,
      phase: 'playing',
      bet: 100,
      chips: 900,
      bets: [100],
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
    expect(state.result).toBeDefined()
    expect(state.result[0]).toBe('win') // 19 vs 17
    expect(state.chips).toBe(1100) // 900 + 200 payout
  })

  it('should handle new round', () => {
    const settledState = {
      ...initialState,
      phase: 'settled',
      chips: 1100,
      bet: 100,
      bets: [100],
      playerHands: [[{ rank: 'K', suit: 'hearts', value: 10 }, { rank: '9', suit: 'clubs', value: 9 }]],
      dealerHand: [{ rank: '10', suit: 'spades', value: 10 }, { rank: '6', suit: 'hearts', value: 6 }],
      deck: Array(200).fill({ rank: '2', suit: 'hearts', value: 2 }),
      result: ['win'],
    }
    const state = gameReducer(settledState, { type: ACTIONS.NEW_ROUND })
    expect(state.phase).toBe('betting')
    expect(state.bet).toBe(0)
    expect(state.playerHands).toEqual([[]])
    expect(state.dealerHand).toEqual([])
  })

  it('should handle double down', () => {
    const playingState = {
      ...initialState,
      phase: 'playing',
      bet: 100,
      chips: 900,
      bets: [100],
      playerHands: [[
        { rank: '5', suit: 'hearts', value: 5 },
        { rank: '6', suit: 'clubs', value: 6 },
      ]],
      activeHandIndex: 0,
      dealerHand: [
        { rank: '10', suit: 'spades', value: 10 },
        { rank: '6', suit: 'hearts', value: 6 },
      ],
      deck: [{ rank: '9', suit: 'diamonds', value: 9 }, ...Array(100).fill({ rank: '2', suit: 'hearts', value: 2 })],
    }
    const state = gameReducer(playingState, { type: ACTIONS.DOUBLE_DOWN })
    // Player gets exactly one more card, bet doubled, then auto-stand and settle
    expect(state.playerHands[0]).toHaveLength(3)
    expect(state.bets[0]).toBe(200)
    expect(state.result[0]).toBe('win')
    expect(state.chips).toBe(1200) // 800 + 400 payout
    expect(state.phase).toBe('settled')
  })

  it('should handle split', () => {
    const playingState = {
      ...initialState,
      phase: 'playing',
      bet: 100,
      chips: 900,
      bets: [100],
      playerHands: [[
        { rank: '8', suit: 'hearts', value: 8 },
        { rank: '8', suit: 'clubs', value: 8 },
      ]],
      activeHandIndex: 0,
      dealerHand: [
        { rank: '10', suit: 'spades', value: 10 },
        { rank: '6', suit: 'hearts', value: 6 },
      ],
      deck: [{ rank: '3', suit: 'diamonds', value: 3 }, { rank: '5', suit: 'diamonds', value: 5 }, ...Array(100).fill({ rank: '2', suit: 'hearts', value: 2 })],
    }
    const state = gameReducer(playingState, { type: ACTIONS.SPLIT })
    expect(state.playerHands).toHaveLength(2)
    expect(state.playerHands[0]).toHaveLength(2) // original card + new card
    expect(state.playerHands[1]).toHaveLength(2) // original card + new card
    expect(state.bets).toHaveLength(2)
    expect(state.bets[0]).toBe(100)
    expect(state.bets[1]).toBe(100)
    expect(state.chips).toBe(800) // 900 - 100 for second hand
  })

  it('should handle insurance', () => {
    const insuranceState = {
      ...initialState,
      phase: 'insurance',
      bet: 100,
      chips: 900,
      bets: [100],
      playerHands: [[
        { rank: 'K', suit: 'hearts', value: 10 },
        { rank: '9', suit: 'clubs', value: 9 },
      ]],
      dealerHand: [
        { rank: 'A', suit: 'spades', value: 11 },
        { rank: '7', suit: 'hearts', value: 7 },
      ],
      deck: Array(100).fill({ rank: '2', suit: 'hearts', value: 2 }),
    }
    const state = gameReducer(insuranceState, { type: ACTIONS.INSURANCE })
    expect(state.insuranceBet).toBe(50) // half of bet
    expect(state.chips).toBe(850) // 900 - 50
    expect(state.phase).toBe('playing')
  })

  it('should handle decline insurance', () => {
    const insuranceState = {
      ...initialState,
      phase: 'insurance',
      bet: 100,
      chips: 900,
      bets: [100],
      playerHands: [[
        { rank: 'K', suit: 'hearts', value: 10 },
        { rank: '9', suit: 'clubs', value: 9 },
      ]],
      dealerHand: [
        { rank: 'A', suit: 'spades', value: 11 },
        { rank: '7', suit: 'hearts', value: 7 },
      ],
      deck: Array(100).fill({ rank: '2', suit: 'hearts', value: 2 }),
    }
    const state = gameReducer(insuranceState, { type: ACTIONS.DECLINE_INSURANCE })
    expect(state.insuranceBet).toBe(0)
    expect(state.phase).toBe('playing')
  })

  it('should reset chips', () => {
    const state = gameReducer({ ...initialState, chips: 0 }, { type: ACTIONS.RESET_CHIPS })
    expect(state.chips).toBe(1000)
  })
})
