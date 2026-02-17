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
