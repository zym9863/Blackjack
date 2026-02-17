import styles from './ChipStack.module.css'
import { sounds } from '../audio/sounds'

const CHIP_COLORS = {
  5: styles.chip5,
  25: styles.chip25,
  100: styles.chip100,
  500: styles.chip500,
}

export default function ChipStack({ value, onClick, disabled = false }) {
  const handleClick = () => {
    if (disabled) return
    sounds.chipPlace()
    onClick(value)
  }

  return (
    <div
      className={`${styles.chip} ${CHIP_COLORS[value] || ''} ${disabled ? styles.disabled : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`下注 ${value}`}
    >
      {value}
    </div>
  )
}
