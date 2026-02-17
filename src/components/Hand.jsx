import Card from './Card'
import { calculateHandValue } from '../logic/rules'
import styles from './Hand.module.css'

export default function Hand({
  cards = [],
  label = '',
  isDealer = false,
  isActive = false,
  showValue = true,
  phase = '',
}) {
  if (cards.length === 0) return null

  const revealAll = phase === 'settled' || phase === 'dealerTurn'

  // Calculate displayed value
  let displayValue = ''
  if (showValue && cards.length > 0) {
    if (isDealer && !revealAll) {
      // Only show value of the first (face-up) card
      const visibleCards = [cards[0]]
      displayValue = String(calculateHandValue(visibleCards))
    } else {
      displayValue = String(calculateHandValue(cards))
    }
  }

  return (
    <div className={`${styles.handContainer} ${isActive ? styles.active : ''}`}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={styles.cardsRow}>
        {cards.map((card, i) => {
          const isFaceDown = isDealer && i === 1 && !revealAll
          return (
            <div className={styles.cardSlot} key={`${card.rank}-${card.suit}-${i}`}>
              <Card
                card={card}
                faceDown={isFaceDown}
                dealDelay={i * 150}
              />
            </div>
          )
        })}
      </div>
      {showValue && displayValue && (
        <div className={styles.valueBadge}>{displayValue}</div>
      )}
    </div>
  )
}
