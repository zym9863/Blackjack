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
  const totalCards = 312
  const needsReshuffle = remaining.length < totalCards * 0.25
  return { card, remaining, needsReshuffle }
}
