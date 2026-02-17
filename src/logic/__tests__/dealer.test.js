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

  it('should not draw if already at 17+', () => {
    const dealerHand = [card('10'), card('8')]
    const deck = [card('K'), card('Q')]
    const { hand, remainingDeck } = playDealerHand(dealerHand, deck)
    expect(hand).toHaveLength(2)
    expect(remainingDeck).toHaveLength(2)
  })
})
