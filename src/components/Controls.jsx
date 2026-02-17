import { canSplit, canDoubleDown } from '../logic/rules'
import { sounds } from '../audio/sounds'
import styles from './Controls.module.css'

export default function Controls({ state, dispatch, ACTIONS }) {
  const { phase, playerHands, activeHandIndex, chips, bet } = state
  const activeHand = playerHands[activeHandIndex] || []

  if (phase === 'playing') {
    const showDouble = canDoubleDown(activeHand) && chips >= bet
    const showSplit = canSplit(activeHand) && chips >= bet

    return (
      <div className={styles.controls}>
        <button
          className={`${styles.btn} ${styles.btnHit}`}
          onClick={() => {
            sounds.dealCard()
            dispatch({ type: ACTIONS.HIT })
          }}
        >
          要牌
        </button>
        <button
          className={`${styles.btn} ${styles.btnStand}`}
          onClick={() => dispatch({ type: ACTIONS.STAND })}
        >
          停牌
        </button>
        {showDouble && (
          <button
            className={`${styles.btn} ${styles.btnDouble}`}
            onClick={() => {
              sounds.chipPlace()
              dispatch({ type: ACTIONS.DOUBLE_DOWN })
            }}
          >
            加倍
          </button>
        )}
        {showSplit && (
          <button
            className={`${styles.btn} ${styles.btnSplit}`}
            onClick={() => {
              sounds.chipPlace()
              dispatch({ type: ACTIONS.SPLIT })
            }}
          >
            分牌
          </button>
        )}
      </div>
    )
  }

  if (phase === 'insurance') {
    return (
      <div className={styles.controls}>
        <button
          className={`${styles.btn} ${styles.btnInsurance}`}
          onClick={() => {
            sounds.chipPlace()
            dispatch({ type: ACTIONS.INSURANCE })
          }}
        >
          买保险
        </button>
        <button
          className={`${styles.btn} ${styles.btnDecline}`}
          onClick={() => dispatch({ type: ACTIONS.DECLINE_INSURANCE })}
        >
          拒绝
        </button>
      </div>
    )
  }

  if (phase === 'settled') {
    return (
      <div className={styles.controls}>
        <button
          className={`${styles.btn} ${styles.btnNewRound}`}
          onClick={() => dispatch({ type: ACTIONS.NEW_ROUND })}
        >
          新一局
        </button>
        {chips === 0 && (
          <button
            className={`${styles.btn} ${styles.btnReset}`}
            onClick={() => {
              dispatch({ type: ACTIONS.RESET_CHIPS })
              dispatch({ type: ACTIONS.NEW_ROUND })
            }}
          >
            重新开始 (1000筹码)
          </button>
        )}
      </div>
    )
  }

  return null
}
