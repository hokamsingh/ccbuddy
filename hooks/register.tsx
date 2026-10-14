import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { create, step } from './walk'

const line = atom({ plugin: 'buddy', key: 'line' } as const, '')
const isHidden = atom({ plugin: 'buddy', key: 'isHidden' } as const, false)

export const register: Register = on => {
  let buddy = create()
  let isWorking = false

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'buddy',
      description: 'Show or hide your little buddy above the prompt',
    })

    $.clock.every(300, async () => {
      if (await read($, isHidden)) {
        return
      }

      const moved = step(buddy, isWorking)
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

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    isWorking = e.props.isWorking
    const text = await read($, line)

    if (e.props.hasSurvey || text === '' || (await read($, isHidden))) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box>
        <Text color="yellow">{text}</Text>
      </Box>
    )
  })
}
