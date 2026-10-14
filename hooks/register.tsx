import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { cheer, create, step } from './walk'

const line = atom({ plugin: 'buddy', key: 'line' } as const, '')
const isHidden = atom({ plugin: 'buddy', key: 'isHidden' } as const, false)

const SPEEDS: Record<string, number> = { slow: 450, normal: 300, fast: 180 }

export const register: Register = (on, options) => {
  const color = String(options.color)
  const rows = options.rows === 'tall' ? 2 : 1
  const tickMs = SPEEDS[String(options.speed)] ?? 300
  const isShownWhileWorking = options.showWhileWorking !== false

  let buddy = create()
  let isWorking = false

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'buddy',
      description: 'Show or hide your little buddy above the prompt',
    })

    $.clock.every(tickMs, async () => {
      if (await read($, isHidden)) {
        return
      }

      const moved = step(buddy, isWorking, Math.random, rows)
      buddy = moved.buddy
      await update($, line, () => moved.line)
    })

    return next(e)
  })

  on('command.run', { command: 'buddy' }, async $ => {
    const hidden = !(await read($, isHidden))
    await update($, isHidden, () => hidden)

    return { text: hidden ? 'Buddy is napping elsewhere.' : 'Buddy is back!' }
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
