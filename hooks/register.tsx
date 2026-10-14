import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { parse } from './command'
import { cheer, create, step } from './walk'
import type { Skin } from './walk'

const line = atom({ plugin: 'buddy', key: 'line' } as const, '')
const isHidden = atom({ plugin: 'buddy', key: 'isHidden' } as const, false)

const SKINS = ['claude', 'minion', 'classic', 'cat', 'bunny', 'ghost', 'robot'] as const

// what `color: auto` means for each skin
const SKIN_COLORS: Record<Skin, string> = {
  claude: 'claude',
  minion: 'yellow',
  classic: 'yellow',
  cat: 'magenta',
  bunny: 'white',
  ghost: 'cyan',
  robot: 'green',
}

const SPEEDS: Record<string, number> = { slow: 450, normal: 300, fast: 180 }

export const register: Register = (on, options) => {
  const skin = (SKINS as readonly string[]).includes(String(options.skin))
    ? (options.skin as Skin)
    : 'claude'
  const color =
    options.color === undefined || options.color === 'auto'
      ? SKIN_COLORS[skin]
      : String(options.color)
  const rows = options.rows === 'tall' ? 2 : 1
  const tickMs = SPEEDS[String(options.speed)] ?? 300
  const isShownWhileWorking = options.showWhileWorking !== false

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
      <Box flexDirection="column">
        {text.split('\n').map(row => (
          <Text color={color}>{row}</Text>
        ))}
      </Box>
    )
  })
}
