import styles from './Card.module.css'

const SUIT_SYMBOLS = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
}

const RED_SUITS = new Set(['hearts', 'diamonds'])

export default function Card({ card, faceDown = false, dealDelay = 0 }) {
  const symbol = card ? SUIT_SYMBOLS[card.suit] : ''
  const isRed = card ? RED_SUITS.has(card.suit) : false
  const colorClass = isRed ? styles.red : styles.black

  return (
    <div
      className={`${styles.cardWrapper} ${faceDown ? styles.flipped : ''} ${dealDelay > 0 ? styles.animated : ''}`}
      style={dealDelay > 0 ? { animationDelay: `${dealDelay}ms` } : undefined}
    >
      <div className={styles.cardInner}>
        {/* Front */}
        <div className={`${styles.cardFace} ${styles.cardFront}`}>
          {card && (
            <>
              <div className={styles.cornerTop}>
                <span className={`${styles.rank} ${colorClass}`}>{card.rank}</span>
                <span className={`${styles.suitSmall} ${colorClass}`}>{symbol}</span>
              </div>
              <span className={`${styles.centerSuit} ${colorClass}`}>{symbol}</span>
              <div className={styles.cornerBottom}>
                <span className={`${styles.rank} ${colorClass}`}>{card.rank}</span>
                <span className={`${styles.suitSmall} ${colorClass}`}>{symbol}</span>
              </div>
            </>
          )}
        </div>
        {/* Back */}
        <div className={`${styles.cardFace} ${styles.cardBack}`} />
      </div>
    </div>
  )
}
