/**
 * Calculate the value of a blackjack hand.
 * Aces count as 11 unless that would bust, then they count as 1.
 * @param {Array<{rank: string, suit: string}>} hand
 * @returns {number}
 */
export function calculateHandValue(hand) {
  let value = 0
  let aces = 0

  for (const card of hand) {
    if (card.rank === 'A') {
      aces += 1
      value += 11
    } else if (['K', 'Q', 'J'].includes(card.rank)) {
      value += 10
    } else {
      value += parseInt(card.rank, 10)
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10
    aces -= 1
  }

  return value
}

/**
 * Check if a hand is a natural blackjack (exactly 2 cards totaling 21).
 * @param {Array<{rank: string, suit: string}>} hand
 * @returns {boolean}
 */
export function isBlackjack(hand) {
  return hand.length === 2 && calculateHandValue(hand) === 21
}

/**
 * Check if a hand has busted (value over 21).
 * @param {Array<{rank: string, suit: string}>} hand
 * @returns {boolean}
 */
export function isBusted(hand) {
  return calculateHandValue(hand) > 21
}

/**
 * Check if a hand is eligible for splitting (exactly 2 cards of the same rank).
 * @param {Array<{rank: string, suit: string}>} hand
 * @returns {boolean}
 */
export function canSplit(hand) {
  return hand.length === 2 && hand[0].rank === hand[1].rank
}

/**
 * Check if a hand is eligible for doubling down (exactly 2 cards).
 * @param {Array<{rank: string, suit: string}>} hand
 * @returns {boolean}
 */
export function canDoubleDown(hand) {
  return hand.length === 2
}
