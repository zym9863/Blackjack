**English** | [中文](./README.md)

# 🃏 Blackjack (21)

A Blackjack (21) card game built with React + Vite.

## ✨ Features

- 🎮 Full Blackjack game logic
- 💰 Chip system (persists to localStorage)
- 🔊 Sound effects
- 🎯 Supported actions:
  - **Hit** - draw another card
  - **Stand** - stop drawing
  - **Double Down** - double the bet and draw exactly one card
  - **Split** - split equal-value cards into two hands
  - **Insurance** - buy insurance when dealer shows an Ace

## 🎲 Rules

- Uses 6 decks (312 cards)
- Blackjack pays 3:2
- Insurance pays 3:1
- Minimum bet: 10
- Maximum bet: 500
- Starting chips: 1000
- Dealer hits on soft 16 and stands on 17+

## 🛠️ Tech Stack

- **React 19** - UI framework
- **Vite 8** - build tool
- **Vitest** - unit tests
- **Testing Library** - React component tests

## 📦 Install & Run

```bash
# install deps
pnpm install

# start dev server
pnpm dev

# build for production
pnpm build

# preview production build
pnpm preview

# run tests
pnpm test

# lint
pnpm lint
```

## 📁 Project Structure

```
src/
├── App.jsx              # App root component
├── main.jsx             # React render entry
├── components/          # UI components
│   ├── GameTable.jsx    # Game table
│   ├── Hand.jsx         # Hand display
│   ├── Card.jsx         # Single card
│   ├── Controls.jsx     # Game controls
│   ├── BettingArea.jsx  # Betting area
│   └── ChipStack.jsx    # Chip stack
├── hooks/
│   └── useGameState.js  # Game state hook
├── logic/               # Game logic
│   ├── deck.js          # deck operations
│   ├── rules.js         # rule checks
│   └── dealer.js        # dealer logic
├── audio/
│   └── sounds.js        # sound management
└── styles/
    └── game.css         # global styles
```

## 🎮 Game Flow

1. **Betting** - click chips to set bet
2. **Deal** - click "Deal" to start
3. **Player Turn** - choose hit, stand, double, or split
4. **Dealer Turn** - dealer draws automatically by rules
5. **Resolve** - compare hands and settle bets

## 📄 License

MIT
