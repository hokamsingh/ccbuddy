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

// one drawn moment: the buddy on the bottom row, extras (hearts, zzz) above
type Frame = { top?: string; bottom: string; isAir?: boolean }

const WALK_LEFT = ['<(•ᴗ•<)', '<(•ᴗ•)<']
const WALK_RIGHT = ['(>•ᴗ•)>', '>(•ᴗ•>)']
const RUN_LEFT = ['<(•o•<)', '<(•o•)<']
const RUN_RIGHT = ['(>•o•)>', '>(•o•>)']

const f = (bottom: string, top?: string): Frame => ({ bottom, top })

const LAND = f('(•ᴗ•)')
const air = (face: string): Frame => ({ top: face, bottom: '  ‾', isAir: true })

// each trick is a short loop of frames, shown 300ms apiece, played twice
const TRICKS: Frame[][] = [
  // wave
  [f('\\(•ᴗ•)'), f('(•ᴗ•)/'), f('\\(•ᴗ•)'), f('(•ᴗ•)/')],
  // dance
  [f('┏(•ᴗ•)┛'), f('┗(•ᴗ•)┓'), f('┏(•ᴗ•)┛'), f('┗(•ᴗ•)┓'), f('♪┏(•ᴗ•)┛♪')],
  // nap
  [
    f('(-ᴗ-)', '      z'),
    f('(-ᴗ-)', '       zZ'),
    f('(-ᴗ-)', '        zZz'),
    f('(-ᴗ-)', '       Zzz'),
  ],
  // hearts
  [
    f('(•ᴗ•)'),
    f('(•ᴗ•)♡', '   ♡'),
    f('(•ᴗ•)♡', '  ♡ ♡'),
    f('(˘ᴗ˘)♡', ' ♡  ♡ ♡'),
  ],
  // sing
  [f('♪(•ᴗ•)', '   ♪'), f('(•ᴗ•)♪', '    ♫'), f('♫(•ᴗ•)', '  ♪  ♬'), f('(•ᴗ•)♫', '   ♬')],
  // hop hop hop
  [LAND, air('(•o•)'), LAND, air('\\(•o•)/'), LAND, air('(•o•)')],
  // dizzy
  [f('(@ᴗ@)', '  ✦'), f('(@o@)', '  ✧'), f('(×ᴗ×)', ' ✦ ✧'), f('(×o×)', '  ✧')],
  // chases a butterfly
  [
    f('(•o•)', '      *~'),
    f('(•o•)', '     ~*'),
    f('(°o°)', '    *~'),
    f('(•o•)', '   ~*'),
    f('(•ᴗ•)ᕗ', '    *'),
    f('(•ᴗ•)♡', '   ♡'),
  ],
  // snack time
  [f('(•ᴗ•) o'), f('(•ᴗ•)o'), f('(•o•)o', '   nom'), f('(•ᴗ•)·', '  nom'), f('(˘ᴗ˘)')],
  // achoo
  [f('(•_•)'), f('(•_•)'), f('(>_<)'), f('(>o<) achoo!'), f('(•ᴗ•)'), f('(•ᴗ•)')],
  // looks around
  [f('(•ᴗ•)'), f('(<ᴗ<)'), f('(<ᴗ<)'), f('(>ᴗ>)'), f('(>ᴗ>)'), f('(•o•)?')],
  // stretch
  [f('(•ᴗ•)'), f('\\(-ᴗ-)/'), f('\\(-o-)/'), f('(˘ᴗ˘)')],
]

// played when a turn finishes, never picked at random
const CHEER: Frame[] = [
  air('\\(★ᴗ★)/'),
  LAND,
  air('\\(★ᴗ★)/'),
  f('\\(★ᴗ★)/', '  ✧ ✦ ✧'),
  f('\\(★ᴗ★)/', ' ✦ ✧ ✦'),
  f('(•ᴗ•)♡', '   ♡'),
]

const ALL = [...TRICKS, CHEER]
const CHEER_KIND = ALL.length - 1
const LOOPS = 2

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

// a turn just finished: celebrate where we stand
export const cheer = (b: Buddy): Buddy => ({
  ...b,
  stopKind: CHEER_KIND,
  stopLeft: CHEER.length * LOOPS,
})

// rows 2 draws extras (hearts, zzz, a hop's height) above the buddy; rows 1
// folds them onto the buddy's own row so the band takes a single row
const draw = (x: number, frame: Frame, rows: 1 | 2): string => {
  const pad = ' '.repeat(x)

  if (rows === 2) {
    return `${pad}${frame.top ?? ''} \n${pad}${frame.bottom} `
  }

  const extra = (frame.top ?? '').trim()
  const body = frame.isAir ? extra : extra ? `${frame.bottom} ${extra}` : frame.bottom

  return `${pad}${body} `
}

// one 300ms step; returns the next buddy and the two rows to draw
export const step = (
  b: Buddy,
  isWorking: boolean,
  roll: () => number = Math.random,
  rows: 1 | 2 = 1,
): { buddy: Buddy; line: string } => {
  const tick = b.tick + 1

  if (b.stopLeft > 0) {
    const frames = ALL[b.stopKind] ?? CHEER
    const frame = frames[(frames.length * LOOPS - b.stopLeft) % frames.length] ?? LAND
    const buddy = { ...b, tick, stopLeft: b.stopLeft - 1 }

    return { buddy, line: draw(b.x, frame, rows) }
  }

  if (b.untilStop <= 0 && b.x > 2 && b.x < TRACK - 12) {
    const stopKind = Math.floor(roll() * TRICKS.length)
    const buddy = {
      ...b,
      tick,
      stopKind,
      stopLeft: (TRICKS[stopKind]?.length ?? 1) * LOOPS,
      untilStop: between(8, 22, roll()),
    }

    return step(buddy, isWorking, roll, rows)
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
  const isBlink = tick % 13 === 0
  const sprite = frames[tick % 2] ?? ''
  const buddy = { ...b, x, dir, tick, untilStop: b.untilStop - 1 }

  return {
    buddy,
    line: draw(x, f(isBlink ? sprite.replaceAll('•', '-') : sprite), rows),
  }
}
