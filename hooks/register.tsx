import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { parse } from './command'
import { cheer, create, step } from './walk'

const line = atom({ plugin: 'buddy', key: 'line' } as const, '')
const isHidden = atom({ plugin: 'buddy', key: 'isHidden' } as const, false)

const SPEEDS: Record<string, number> = { slow: 450, normal: 300, fast: 180 }

export const register: Register = (on, options) => {
  const skin =
    options.skin === 'classic' || options.skin === 'minion' ? options.skin : 'claude'
  const color =
    options.color === undefined || options.color === 'auto'
      ? { claude: 'claude', minion: 'yellow', classic: 'yellow' }[skin]
      : String(options.color)
  const rows = options.rows === 'tall' ? 2 : 1
  const tickMs = SPEEDS[String(options.speed)] ?? 300
  const isShownWhileWorking = options.showWhileWorking !== false
  const isSnug = options.snug !== false

  let buddy = create()
  let isWorking = false

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'ccbuddy',
      description: 'Buddy options: skin, color, speed, rows, working, hide, show',
    })

    $.clock.every(tickMs, async () => {
      if (await read($, isHidden)) {
        return
      }

      const moved = step(buddy, isWorking, Math.random, rows, skin)
      buddy = moved.buddy
      await update($, line, () => moved.line)
    })

    return next(e)
  })

  on('command.run', { command: 'ccbuddy' }, async ($, e) => {
    const outcome = parse(e.args, {
      skin,
      color: String(options.color ?? 'auto'),
      speed: String(options.speed),
      rows: rows === 2 ? 'tall' : 'compact',
      showWhileWorking: isShownWhileWorking,
      snug: isSnug,
      isHidden: await read($, isHidden),
    })

    if (outcome.kind === 'hide') {
      await update($, isHidden, () => outcome.isHidden)
    }

    if (outcome.kind === 'set') {
      // a config row's key is `<plugin>.<field>`; saving it reloads this module
      const row = (await $.config.list()).find(
        r => r.key.endsWith(`.${outcome.field}`) && r.provider.plugin === 'buddy',
      )
      const saved = await $.config.set({
        key: row?.key ?? `buddy.${outcome.field}`,
        value: outcome.value,
      })

      if ('deny' in saved) {
        return { text: `Could not change it: ${saved.deny}` }
      }
    }

    return { text: outcome.text }
  })

  on('turn.complete', ($, e, next) => {
    buddy = cheer(buddy)

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    isWorking = e.props.isWorking
    const text = await read($, line)

    if (e.props.hasSurvey || (e.props.isWorking && !isShownWhileWorking) || text === '' || (await read($, isHidden))) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)

    return (
      // the engine leaves a blank row under the band; -1 closes it
      <Box flexDirection="column" marginBottom={isSnug ? -1 : 0}>
        {text.split('\n').map(row => (
          <Text color={color}>{row}</Text>
        ))}
      </Box>
    )
  })
}
