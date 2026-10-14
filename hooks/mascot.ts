// The Claude Code mascot, drawn in block characters. Pure, so it is easy to test.

type Shown = { top?: string; bottom: string; isAir?: boolean }

type Pose = 'stand' | 'step' | 'up' | 'shut' | 'dizzy'

// compact: head and arms, two rows
const SMALL: Record<Pose, string[]> = {
  stand: [' ▐▛██▜▌ ', '▝▜████▛▘'],
  step: [' ▐▛██▜▌ ', '▗▜████▛▖'],
  up: ['▘▐▛██▜▌▝', ' ▜████▛ '],
  shut: [' ▐████▌ ', '▝▜████▛▘'],
  dizzy: [' ▐▙██▟▌ ', '▝▜████▛▘'],
}

// tall: the same with legs, three rows
const TALL: Record<Pose, string[]> = {
  stand: [' ▐▛███▜▌ ', '▝▜█████▛▘', '  ▘▘ ▝▝  '],
  step: [' ▐▛███▜▌ ', '▝▜█████▛▘', '  ▝▝ ▘▘  '],
  up: ['▘▐▛███▜▌▝', ' ▜█████▛ ', '  ▘▘ ▝▝  '],
  shut: [' ▐█████▌ ', '▝▜█████▛▘', '  ▘▘ ▝▝  '],
  dizzy: [' ▐▙███▟▌ ', '▝▜█████▛▘', '  ▘▘ ▝▝  '],
}

// the text frames draw a face; read the mood off it
const poseOf = (frame: Shown, tick: number): Pose => {
  const face = frame.bottom

  if (frame.isAir || /\\\(|\)\/|[┏┗]/.test(face)) return 'up'
  if (/[@×]/.test(face)) return 'dizzy'
  if (face.includes('(-')) return 'shut'

  return tick % 2 === 0 ? 'stand' : 'step'
}

// hearts, notes, words: whatever the frame draws around the face
const extrasOf = (frame: Shown): string => {
  const around = frame.bottom.match(/^(.*?)\((.*)\)(.*)$/)
  const beside = around ? `${around[1]} ${around[3]}` : ''
  const words = frame.isAir ? '' : (frame.top ?? '')

  return `${beside} ${words}`.replace(/[\\/┏┓┗┛<>]/g, '').replace(/\s+/g, ' ').trim()
}

export const drawMascot = (
  x: number,
  frame: Shown,
  tick: number,
  isTall: boolean,
): string => {
  const pad = ' '.repeat(x)
  const rows = (isTall ? TALL : SMALL)[poseOf(frame, tick)]
  const extras = extrasOf(frame)

  return rows
    .map((row, i) => `${pad}${row}${i === 0 && extras ? `  ${extras}` : ''} `)
    .join('\n')
}
