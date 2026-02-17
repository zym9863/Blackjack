import { calculateHandValue } from './rules'

/**
 * Determine if the dealer should hit based on standard blackjack rules.
 * Dealer stands on 17 or higher (including soft 17).
 * @param {Array<{rank: string, suit: string}>} hand
 * @returns {boolean}
 */
export function shouldDealerHit(hand) {
  return calculateHandValue(hand) < 17
}

/**
 * Play out the dealer's hand according to standard rules.
 * The dealer draws cards from the deck until reaching 17 or higher.
 * @param {Array<{rank: string, suit: string}>} hand - The dealer's current hand
 * @param {Array<{rank: string, suit: string}>} deck - The remaining deck
 * @returns {{ hand: Array, remainingDeck: Array }}
 */
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
