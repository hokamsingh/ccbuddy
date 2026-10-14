import { test, expect } from 'claude-code/testing'

import { parse } from './command'

const now = { skin: 'minion', color: 'yellow', speed: 'normal', rows: 'compact', showWhileWorking: true, isHidden: false }

test('no args lists the options', () => {
  const out = parse('', now)
  expect(out.kind).toBe('text')
  expect(out.text).toContain('/ccbuddy skin')
})

test('sets a choice and rejects a bad one', () => {
  expect(parse('color cyan', now)).toMatchObject({ kind: 'set', field: 'color', value: 'cyan' })
  expect(parse('Colour  CYAN', now)).toMatchObject({ kind: 'set', field: 'color', value: 'cyan' })
  expect(parse('color pink', now).kind).toBe('text')
  expect(parse('rows tall', now)).toMatchObject({ field: 'rows', value: 'tall' })
})

test('working takes on or off', () => {
  expect(parse('working off', now)).toMatchObject({ field: 'showWhileWorking', value: false })
  expect(parse('working', now).kind).toBe('text')
})

test('hide, show and toggle', () => {
  expect(parse('hide', now)).toMatchObject({ kind: 'hide', isHidden: true })
  expect(parse('toggle', { ...now, isHidden: true })).toMatchObject({ isHidden: false })
})
