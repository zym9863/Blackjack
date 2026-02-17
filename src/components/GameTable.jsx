import { useEffect } from 'react'
import Hand from './Hand'
import Controls from './Controls'
import BettingArea from './BettingArea'
import { calculateHandValue } from '../logic/rules'
import { sounds } from '../audio/sounds'
import styles from './GameTable.module.css'

function getResultMessages(result, bets) {
  if (!result) return []

  return result.map((r, i) => {
    const bet = bets[i]
    switch (r) {
      case 'blackjack': {
        const winAmount = Math.floor(bet * 1.5)
        return { text: `Blackjack! +${winAmount + bet}`, type: 'blackjack' }
      }
      case 'win':
        return { text: `赢了! +${bet * 2}`, type: 'win' }
      case 'lose':
        return { text: '输了', type: 'lose' }
      case 'push':
        return { text: '平局', type: 'push' }
      default:
        return null
    }
  }).filter(Boolean)
}

export default function GameTable({ state, dispatch, ACTIONS }) {
  const { phase, chips, bet, bets, playerHands, dealerHand, activeHandIndex, result } = state
  const isSplit = playerHands.length > 1

  // Play sound effects based on phase transitions
  useEffect(() => {
    if (phase === 'settled' && result) {
      const hasBlackjack = result.includes('blackjack')
      const hasWin = result.includes('win')
      const allLose = result.every(r => r === 'lose')

      if (hasBlackjack) {
        sounds.blackjack()
      } else if (hasWin) {
        sounds.win()
      } else if (allLose) {
        sounds.lose()
      }
    }
  }, [phase, result])

  const resultMessages = getResultMessages(result, bets)

  return (
    <div className={styles.table}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.chipsDisplay}>
          <span className={styles.coinIcon}>🪙</span>
          <span>{chips}</span>
        </div>
        <div className={styles.title}>21点</div>
        <div className={styles.placeholder} />
      </div>

      {/* Play area */}
      <div className={styles.playArea}>
        {/* Dealer area */}
        <div className={styles.dealerArea}>
          <Hand
            cards={dealerHand}
            label="庄家"
            isDealer={true}
            showValue={dealerHand.length > 0}
            phase={phase}
          />
        </div>

        {/* Middle area */}
        <div className={styles.middleArea}>
          {phase === 'settled' && resultMessages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.resultMessage} ${
                msg.type === 'blackjack' ? styles.resultBlackjack :
                msg.type === 'win' ? styles.resultWin :
                msg.type === 'lose' ? styles.resultLose :
                styles.resultPush
              }`}
            >
              {isSplit && `手牌${i + 1}: `}{msg.text}
            </div>
          ))}

          {phase !== 'betting' && phase !== 'settled' && (
            <div className={styles.betInfo}>
              下注: {bets.reduce((s, b) => s + b, 0)}
            </div>
          )}
        </div>

        {/* Player area */}
        <div className={styles.playerArea}>
          {playerHands.map((hand, i) => (
            <div className={styles.handWrapper} key={i}>
              <Hand
                cards={hand}
                label={isSplit ? `玩家 手牌${i + 1}` : '玩家'}
                isDealer={false}
                isActive={isSplit && i === activeHandIndex && phase === 'playing'}
                showValue={hand.length > 0}
                phase={phase}
              />
              {isSplit && (
                <div className={styles.handLabel}>
                  下注: {bets[i]}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom area */}
        <div className={styles.bottomArea}>
          {phase === 'betting' ? (
            <BettingArea
              chips={chips}
              bet={bet}
              dispatch={dispatch}
              ACTIONS={ACTIONS}
            />
          ) : (
            <Controls
              state={state}
              dispatch={dispatch}
              ACTIONS={ACTIONS}
            />
          )}
        </div>
      </div>
    </div>
  )
}
