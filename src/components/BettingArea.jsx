import ChipStack from './ChipStack'
import { sounds } from '../audio/sounds'
import styles from './BettingArea.module.css'

const CHIP_VALUES = [5, 25, 100, 500]

export default function BettingArea({ chips, bet, dispatch, ACTIONS }) {
  const handleChipClick = (value) => {
    dispatch({ type: ACTIONS.PLACE_BET, payload: value })
  }

  const handleClear = () => {
    dispatch({ type: ACTIONS.CLEAR_BET })
  }

  const handleDeal = () => {
    if (bet >= 10) {
      // Staggered deal sounds for 4 cards
      sounds.dealCard()
      setTimeout(() => sounds.dealCard(), 150)
      setTimeout(() => sounds.dealCard(), 300)
      setTimeout(() => sounds.dealCard(), 450)
      dispatch({ type: ACTIONS.DEAL })
    }
  }

  return (
    <div className={styles.bettingArea}>
      <div className={styles.chipsRow}>
        {CHIP_VALUES.map((value) => (
          <ChipStack
            key={value}
            value={value}
            onClick={handleChipClick}
            disabled={value > chips}
          />
        ))}
      </div>

      <div className={styles.betDisplay}>
        当前下注: <span className={styles.betAmount}>{bet}</span>
      </div>

      <div className={styles.buttonsRow}>
        <button
          className={`${styles.btn} ${styles.btnClear}`}
          onClick={handleClear}
          disabled={bet === 0}
        >
          清除
        </button>
        <button
          className={`${styles.btn} ${styles.btnDeal}`}
          onClick={handleDeal}
          disabled={bet < 10}
        >
          发牌
        </button>
      </div>
    </div>
  )
}
