import './styles/game.css'
import GameTable from './components/GameTable'
import { useGameState } from './hooks/useGameState'

function App() {
  const { state, dispatch, ACTIONS } = useGameState()
  return <GameTable state={state} dispatch={dispatch} ACTIONS={ACTIONS} />
}

export default App
