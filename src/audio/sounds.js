let audioCtx = null

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioCtx
}

function playTone(frequency, duration, type = 'sine', volume = 0.3) {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, ctx.currentTime)
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + duration)
}

function playNoise(duration, volume = 0.15) {
  const ctx = getCtx()
  const bufferSize = ctx.sampleRate * duration
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 3000
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start()
  source.stop(ctx.currentTime + duration)
}

export const sounds = {
  dealCard() {
    playNoise(0.08, 0.2)
  },

  chipPlace() {
    playTone(800, 0.05, 'square', 0.1)
    setTimeout(() => playTone(1200, 0.03, 'square', 0.08), 30)
  },

  win() {
    playTone(523, 0.15, 'sine', 0.25)
    setTimeout(() => playTone(659, 0.15, 'sine', 0.25), 100)
    setTimeout(() => playTone(784, 0.3, 'sine', 0.25), 200)
  },

  lose() {
    playTone(400, 0.2, 'sine', 0.2)
    setTimeout(() => playTone(300, 0.3, 'sine', 0.2), 150)
  },

  blackjack() {
    playTone(523, 0.1, 'sine', 0.3)
    setTimeout(() => playTone(659, 0.1, 'sine', 0.3), 80)
    setTimeout(() => playTone(784, 0.1, 'sine', 0.3), 160)
    setTimeout(() => playTone(1047, 0.4, 'sine', 0.3), 240)
  },

  bust() {
    playTone(200, 0.3, 'sawtooth', 0.15)
  },

  flip() {
    playNoise(0.05, 0.15)
    playTone(600, 0.05, 'sine', 0.1)
  },
}
