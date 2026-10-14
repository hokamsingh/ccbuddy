// Pure buddy brain: no engine calls, so it is easy to test.

export const TRACK = 44

type Dir = 'left' | 'right'

export type Buddy = {
  x: number
  dir: Dir
  tick: number
  // frames left of the current stop, 0 while walking
  stopLeft: number
  stopKind: number
  // steps until the next random stop
  untilStop: number
}

const WALK_LEFT = ['<(•ᴗ•<)', '<(•ᴗ•)<']
const WALK_RIGHT = ['(>•ᴗ•)>', '>(•ᴗ•>)']
const RUN_LEFT = ['<(•o•<)', '<(•o•)<']
const RUN_RIGHT = ['(>•o•)>', '>(•o•>)']

// each stop is a short loop of frames, shown 300ms apiece
const STOPS: string[][] = [
  ['\\(•ᴗ•)', '(•ᴗ•)/', '\\(•ᴗ•)', '(•ᴗ•)/'],
  ['┏(•ᴗ•)┛', '┗(•ᴗ•)┓', '┏(•ᴗ•)┛', '┗(•ᴗ•)┓', '┏(•ᴗ•)┛'],
  ['(-ᴗ-)  z', '(-ᴗ-)  zZ', '(-ᴗ-)  zZz', '(-ᴗ-)  Zzz', '(-ᴗ-)  zZ'],
  ['(•ᴗ•)', '(•ᴗ•) ♡', '(•ᴗ•)  ♡', '(•ᴗ•) ♡', '(•ᴗ•)'],
  ['♪(•ᴗ•)', '(•ᴗ•)♪', '♫(•ᴗ•)', '(•ᴗ•)♫', '♪(•ᴗ•)'],
  ['(•_•)', '(•_•)?', '(•o•)!', '\\(•ᴗ•)/'],
]

const between = (lo: number, hi: number, roll: number) =>
  lo + Math.floor(roll * (hi - lo + 1))

export const create = (roll: () => number = Math.random): Buddy => ({
  x: TRACK,
  dir: 'left',
  tick: 0,
  stopLeft: 0,
  stopKind: 0,
  untilStop: between(6, 16, roll()),
})

// one 300ms step; returns the next buddy and the line to draw
export const step = (
  b: Buddy,
  isWorking: boolean,
  roll: () => number = Math.random,
): { buddy: Buddy; line: string } => {
  const tick = b.tick + 1

  if (b.stopLeft > 0) {
    const frames = STOPS[b.stopKind]
    const frame = frames[(frames.length - b.stopLeft) % frames.length]
    const buddy = { ...b, tick, stopLeft: b.stopLeft - 1 }

    return { buddy, line: ' '.repeat(b.x) + frame }
  }

  if (b.untilStop <= 0 && b.x > 2 && b.x < TRACK - 8) {
    const stopKind = Math.floor(roll() * STOPS.length)
    const buddy = {
      ...b,
      tick,
      stopKind,
      stopLeft: STOPS[stopKind].length * 2,
      untilStop: between(8, 22, roll()),
    }

    return step(buddy, isWorking, roll)
  }

  const speed = isWorking ? 2 : 1
  const next = b.dir === 'left' ? b.x - speed : b.x + speed
  const isEdge = next <= 0 || next >= TRACK
  const dir: Dir = isEdge ? (b.dir === 'left' ? 'right' : 'left') : b.dir
  const x = Math.min(TRACK, Math.max(0, next))
  const frames =
    dir === 'left'
      ? isWorking ? RUN_LEFT : WALK_LEFT
      : isWorking ? RUN_RIGHT : WALK_RIGHT
  const buddy = { ...b, x, dir, tick, untilStop: b.untilStop - 1 }

  return { buddy, line: ' '.repeat(x) + frames[tick % 2] }
}
