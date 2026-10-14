// More pets, drawn in text and box characters. Pure, so it is easy to test.

import { extrasOf, poseOf } from './mascot'
import type { Pose, Shown } from './mascot'

export const PETS = ['cat', 'bunny', 'ghost', 'robot'] as const
export type Pet = (typeof PETS)[number]

export const isPet = (skin: string): skin is Pet =>
  (PETS as readonly string[]).includes(skin)

// every pet draws three rows (head, face, feet); compact keeps the first two
type Sprite = (pose: Pose, isStep: boolean) => string[]

const FACE: Record<Pet, Record<Pose, string>> = {
  cat: { stand: 'o.o', step: 'o.o', up: '^.^', shut: '-.-', dizzy: '@.@' },
  bunny: { stand: '•.•', step: '•.•', up: '^.^', shut: '-.-', dizzy: '@.@' },
  ghost: { stand: 'o o', step: 'o o', up: '^ ^', shut: '- -', dizzy: '@ @' },
  robot: { stand: 'o_o', step: 'o_o', up: '^_^', shut: '-_-', dizzy: 'x_x' },
}

const SPRITES: Record<Pet, Sprite> = {
  cat: (pose, isStep) => {
    const e = FACE.cat[pose]
    const paws = pose === 'up'
    return [
      paws ? '\\/\\_/\\/' : ' /\\_/\\  ',
      paws ? `\\( ${e} )/` : `( ${e} )${isStep ? '~' : ' '}`,
      isStep ? '  U  U  ' : '  U U   ',
    ]
  },
  bunny: (pose, isStep) => {
    const e = FACE.bunny[pose]
    return [
      pose === 'up' ? ' (\\_/)/ ' : isStep ? ' (/_\\)  ' : ' (\\_/)  ',
      pose === 'up' ? `\\( ${e} ) ` : `( ${e} )  `,
      isStep ? ' (")_(") ' : ' (")(")  ',
    ]
  },
  ghost: (pose, isStep) => {
    const e = FACE.ghost[pose]
    return [
      pose === 'up' ? '\\.-"-./ ' : ' .-"-.  ',
      `| ${e} | `,
      isStep ? ' v^v^v   ' : ' ^v^v^   ',
    ]
  },
  robot: (pose, isStep) => {
    const e = FACE.robot[pose]
    return [
      pose === 'up' ? '\\╔═══╗/' : ' ╔═══╗ ',
      pose === 'up' ? ` ║${e}║ ` : ` ║${e}║ `,
      isStep ? ' ╚╩═╩╝ ' : ' ╚╦═╦╝ ',
    ]
  },
}

export const drawPet = (
  pet: Pet,
  x: number,
  frame: Shown,
  tick: number,
  isTall: boolean,
): string => {
  const pad = ' '.repeat(x)
  const pose = poseOf(frame, tick)
  const rows = SPRITES[pet](pose, tick % 2 === 1).slice(0, isTall ? 3 : 2)
  const extras = extrasOf(frame)

  return rows
    .map((row, i) => `${pad}${row}${i === 0 && extras ? `  ${extras}` : ''} `)
    .join('\n')
}
