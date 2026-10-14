// The /ccbuddy command: parses what was typed. Pure, so it is easy to test.

export const CHOICES = {
  color: ['yellow', 'magenta', 'cyan', 'green', 'red', 'blue', 'white'],
  speed: ['slow', 'normal', 'fast'],
  rows: ['compact', 'tall'],
} as const

export type Current = {
  color: string
  speed: string
  rows: string
  showWhileWorking: boolean
  isHidden: boolean
}

export type Outcome =
  | { kind: 'text'; text: string }
  | { kind: 'hide'; isHidden: boolean; text: string }
  | { kind: 'set'; field: string; value: string | boolean; text: string }

const ALIASES: Record<string, string> = {
  colour: 'color',
  height: 'rows',
  size: 'rows',
  work: 'working',
  busy: 'working',
}

export const help = (c: Current): string =>
  [
    `ccbuddy: ${c.isHidden ? 'hidden' : 'showing'}`,
    `  color    ${c.color}  (${CHOICES.color.join(', ')})`,
    `  speed    ${c.speed}  (${CHOICES.speed.join(', ')})`,
    `  rows     ${c.rows}  (compact takes one row, tall takes two)`,
    `  working  ${c.showWhileWorking ? 'on' : 'off'}  (show while Claude works)`,
    '',
    'Usage: /ccbuddy color pink | speed fast | rows tall | working off | hide | show',
  ].join('\n')

export const parse = (args: string, c: Current): Outcome => {
  const [raw = '', value = ''] = args.trim().toLowerCase().split(/\s+/)
  const word = ALIASES[raw] ?? raw

  if (word === '' || word === 'help' || word === 'options') {
    return { kind: 'text', text: help(c) }
  }

  if (word === 'hide' || word === 'show' || word === 'toggle') {
    const isHidden = word === 'toggle' ? !c.isHidden : word === 'hide'

    return {
      kind: 'hide',
      isHidden,
      text: isHidden ? 'Buddy is napping elsewhere.' : 'Buddy is back!',
    }
  }

  if (word === 'working') {
    const isOn = ['on', 'yes', 'true'].includes(value)
    const isOff = ['off', 'no', 'false'].includes(value)

    if (!isOn && !isOff) {
      return { kind: 'text', text: 'Usage: /ccbuddy working on|off' }
    }

    return {
      kind: 'set',
      field: 'showWhileWorking',
      value: isOn,
      text: `Buddy ${isOn ? 'stays' : 'steps out'} while Claude works.`,
    }
  }

  if (word === 'color' || word === 'speed' || word === 'rows') {
    const choices: readonly string[] = CHOICES[word]

    if (!choices.includes(value)) {
      return { kind: 'text', text: `${word} is one of: ${choices.join(', ')}` }
    }

    return { kind: 'set', field: word, value, text: `Buddy ${word}: ${value}.` }
  }

  return { kind: 'text', text: `Unknown option "${raw}".\n\n${help(c)}` }
}
