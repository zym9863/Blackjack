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
    expect(deck).toEqual(original)
    expect(shuffled).toHaveLength(52)
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
    const deck = createDeck(6)
    const smallDeck = deck.slice(0, 77)
    const { needsReshuffle } = dealCard(smallDeck)
    expect(needsReshuffle).toBe(true)
  })
})
