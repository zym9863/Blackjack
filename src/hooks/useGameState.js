import { useReducer, useEffect } from 'react'
import { createDeck, shuffle, dealCard } from '../logic/deck'
import { calculateHandValue, isBlackjack, isBusted } from '../logic/rules'
import { playDealerHand } from '../logic/dealer'

const MAX_BET = 500
const MIN_BET = 10
const DEFAULT_CHIPS = 1000

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
  __SETTLE: '__SETTLE',
}

function getInitialChips() {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('blackjack-chips')
    if (saved !== null) {
      const parsed = parseInt(saved, 10)
      if (!isNaN(parsed) && parsed > 0) return parsed
    }
  }
  return DEFAULT_CHIPS
}

export const initialState = {
  phase: 'betting',
  chips: DEFAULT_CHIPS,
  bet: 0,
  bets: [0],
  playerHands: [[]],
  dealerHand: [],
  deck: shuffle(createDeck(6)),
  activeHandIndex: 0,
  insuranceBet: 0,
  result: null,
}

/**
 * Determine the result of a single player hand vs the dealer hand.
 */
function settleHand(playerHand, dealerHand) {
  const playerBJ = isBlackjack(playerHand)
  const dealerBJ = isBlackjack(dealerHand)

  if (playerBJ && dealerBJ) return 'push'
  if (playerBJ) return 'blackjack'
  if (dealerBJ) return 'lose'

  const playerValue = calculateHandValue(playerHand)
  const dealerValue = calculateHandValue(dealerHand)

  if (isBusted(playerHand)) return 'lose'
  if (isBusted(dealerHand)) return 'win'
  if (playerValue > dealerValue) return 'win'
  if (playerValue < dealerValue) return 'lose'
  return 'push'
}

/**
 * Calculate total payout given results, bets, insurance, and dealer hand.
 * Returns the total amount to add to chips.
 */
function calculatePayout(results, bets, insuranceBet, dealerHand) {
  let payout = 0

  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    const bet = bets[i]

    switch (result) {
      case 'blackjack':
        payout += bet + Math.floor(bet * 1.5) // 3:2 payout
        break
      case 'win':
        payout += bet * 2 // 2:1 payout
        break
      case 'push':
        payout += bet // return bet
        break
      case 'lose':
        // nothing returned
        break
    }
  }

  // Insurance pays 3:1 (returns 3x insurance bet) if dealer has blackjack
  if (insuranceBet > 0 && isBlackjack(dealerHand)) {
    payout += insuranceBet * 3
  }

  return payout
}

/**
 * Helper to draw a card from the deck.
 */
function draw(deck) {
  const { card, remaining, needsReshuffle } = dealCard(deck)
  if (needsReshuffle) {
    const reshuffled = shuffle(createDeck(6))
    return { card, deck: reshuffled }
  }
  return { card, deck: remaining }
}

/**
 * Settle all hands: play dealer, compute results.
 * Returns partial state with dealerHand, deck, result, and payout.
 */
function settleAllHands(state) {
  const { hand: finalDealerHand, remainingDeck } = playDealerHand(state.dealerHand, state.deck)

  const results = state.playerHands.map(hand => settleHand(hand, finalDealerHand))
  const payout = calculatePayout(results, state.bets, state.insuranceBet || 0, finalDealerHand)

  return {
    dealerHand: finalDealerHand,
    deck: remainingDeck,
    result: results,
    payout,
  }
}

export function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.PLACE_BET: {
      const amount = action.payload
      if (amount > state.chips) return state
      if (state.bet + amount > MAX_BET) return state
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
      if (state.bet < MIN_BET) return state

      let deck = [...state.deck]
      const playerCards = []
      const dealerCards = []

      // Deal alternating: player, dealer, player, dealer
      let d1 = draw(deck); playerCards.push(d1.card); deck = d1.deck
      let d2 = draw(deck); dealerCards.push(d2.card); deck = d2.deck
      let d3 = draw(deck); playerCards.push(d3.card); deck = d3.deck
      let d4 = draw(deck); dealerCards.push(d4.card); deck = d4.deck

      // Determine initial phase
      let phase = 'playing'
      const dealerShowsAce = dealerCards[0].rank === 'A'
      const playerHasBJ = isBlackjack(playerCards)

      if (dealerShowsAce) {
        phase = 'insurance'
      } else if (playerHasBJ) {
        phase = 'dealerTurn'
      }

      return {
        ...state,
        deck,
        playerHands: [playerCards],
        dealerHand: dealerCards,
        bets: [state.bet],
        activeHandIndex: 0,
        insuranceBet: 0,
        result: null,
        phase,
      }
    }

    case ACTIONS.HIT: {
      if (state.phase !== 'playing') return state

      const { card, deck: newDeck } = draw(state.deck)
      const hands = state.playerHands.map((hand, i) =>
        i === state.activeHandIndex ? [...hand, card] : hand
      )
      const activeHand = hands[state.activeHandIndex]

      if (isBusted(activeHand)) {
        // Check if there are more hands to play (from split)
        const nextIndex = state.activeHandIndex + 1
        if (nextIndex < hands.length) {
          return {
            ...state,
            deck: newDeck,
            playerHands: hands,
            activeHandIndex: nextIndex,
          }
        }
        // Last hand busted, move to dealer turn
        return {
          ...state,
          deck: newDeck,
          playerHands: hands,
          phase: 'dealerTurn',
        }
      }

      return {
        ...state,
        deck: newDeck,
        playerHands: hands,
      }
    }

    case ACTIONS.STAND: {
      if (state.phase !== 'playing') return state

      // Check if there are more hands to play (from split)
      const nextIndex = state.activeHandIndex + 1
      if (nextIndex < state.playerHands.length) {
        return {
          ...state,
          activeHandIndex: nextIndex,
        }
      }

      // Last hand stood, play dealer and settle
      const settlement = settleAllHands(state)
      return {
        ...state,
        dealerHand: settlement.dealerHand,
        deck: settlement.deck,
        result: settlement.result,
        chips: state.chips + settlement.payout,
        phase: 'settled',
      }
    }

    case ACTIONS.DOUBLE_DOWN: {
      if (state.phase !== 'playing') return state

      const currentBet = state.bets[state.activeHandIndex]
      if (currentBet > state.chips) return state

      // Double the bet for the active hand
      const newBets = [...state.bets]
      newBets[state.activeHandIndex] = currentBet * 2
      const newChips = state.chips - currentBet

      // Draw exactly one card
      const { card, deck: newDeck } = draw(state.deck)
      const hands = state.playerHands.map((hand, i) =>
        i === state.activeHandIndex ? [...hand, card] : hand
      )

      // Check if there are more hands to play (from split)
      const nextIndex = state.activeHandIndex + 1
      if (nextIndex < hands.length) {
        return {
          ...state,
          deck: newDeck,
          playerHands: hands,
          bets: newBets,
          chips: newChips,
          activeHandIndex: nextIndex,
        }
      }

      // Auto-stand: play dealer and settle
      const stateForSettle = {
        ...state,
        deck: newDeck,
        playerHands: hands,
        bets: newBets,
        chips: newChips,
      }
      const settlement = settleAllHands(stateForSettle)
      return {
        ...stateForSettle,
        dealerHand: settlement.dealerHand,
        deck: settlement.deck,
        result: settlement.result,
        chips: stateForSettle.chips + settlement.payout,
        phase: 'settled',
      }
    }

    case ACTIONS.SPLIT: {
      if (state.phase !== 'playing') return state

      const activeHand = state.playerHands[state.activeHandIndex]
      if (activeHand.length !== 2 || activeHand[0].rank !== activeHand[1].rank) return state

      const currentBet = state.bets[state.activeHandIndex]
      if (currentBet > state.chips) return state

      // Split the hand
      const card1 = activeHand[0]
      const card2 = activeHand[1]

      // Deal one card to each new hand
      const { card: newCard1, deck: deck1 } = draw(state.deck)
      const { card: newCard2, deck: deck2 } = draw(deck1)

      const hand1 = [card1, newCard1]
      const hand2 = [card2, newCard2]

      // Build new hands array
      const newHands = [...state.playerHands]
      newHands[state.activeHandIndex] = hand1
      newHands.splice(state.activeHandIndex + 1, 0, hand2)

      // Build new bets array
      const newBets = [...state.bets]
      newBets.splice(state.activeHandIndex + 1, 0, currentBet)

      return {
        ...state,
        playerHands: newHands,
        bets: newBets,
        chips: state.chips - currentBet,
        deck: deck2,
        activeHandIndex: state.activeHandIndex,
      }
    }

    case ACTIONS.INSURANCE: {
      if (state.phase !== 'insurance') return state

      const insuranceAmount = Math.floor(state.bet / 2)
      return {
        ...state,
        insuranceBet: insuranceAmount,
        chips: state.chips - insuranceAmount,
        phase: 'playing',
      }
    }

    case ACTIONS.DECLINE_INSURANCE: {
      if (state.phase !== 'insurance') return state

      return {
        ...state,
        insuranceBet: 0,
        phase: 'playing',
      }
    }

    case ACTIONS.NEW_ROUND: {
      // Check if deck needs reshuffling (less than 25% remaining)
      let deck = state.deck
      const totalCards = 312 // 6 * 52
      if (deck.length < totalCards * 0.25) {
        deck = shuffle(createDeck(6))
      }

      return {
        ...state,
        phase: 'betting',
        bet: 0,
        bets: [0],
        playerHands: [[]],
        dealerHand: [],
        activeHandIndex: 0,
        insuranceBet: 0,
        result: null,
        deck,
      }
    }

    case ACTIONS.RESET_CHIPS: {
      return {
        ...state,
        chips: DEFAULT_CHIPS,
      }
    }

    case ACTIONS.__SETTLE: {
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

    default:
      return state
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialState,
    chips: getInitialChips(),
  })

  // Persist chips to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('blackjack-chips', String(state.chips))
    }
  }, [state.chips])

  // Auto-settle on dealer turn phase
  useEffect(() => {
    if (state.phase !== 'dealerTurn') return

    const timer = setTimeout(() => {
      const settlement = settleAllHands(state)
      dispatch({
        type: ACTIONS.__SETTLE,
        payload: {
          dealerHand: settlement.dealerHand,
          deck: settlement.deck,
          results: settlement.result,
          payout: settlement.payout,
        },
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [state.phase])

  return { state, dispatch, ACTIONS }
}
