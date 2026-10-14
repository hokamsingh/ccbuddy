import { test, expect } from 'claude-code/testing'

import { TRACK, cheer, create, step } from './walk'

const never = () => 0.5

test('walks right to left, then turns at the edge', () => {
  let b = { ...create(never), untilStop: 9999 }
  const xs: number[] = []
  for (let i = 0; i < TRACK + 5; i++) {
    b = step(b, false, never).buddy
    xs.push(b.x)
  }
  expect(xs[0]).toBeLessThan(TRACK)
  expect(Math.min(...xs)).toBe(0)
  expect(b.dir).toBe('right')
})

test('stops mid-track, then walks on', () => {
  let b = { ...create(never), untilStop: 0 }
  b = step({ ...b, x: 20 }, false, never).buddy
  expect(b.stopLeft).toBeGreaterThan(0)
  const stopX = b.x
  while (b.stopLeft > 0) {
    b = step(b, false, never).buddy
    expect(b.x).toBe(stopX)
  }
  b = step(b, false, never).buddy
  expect(b.x).toBeLessThan(stopX)
})

test('every frame of every stop draws two rows, never undefined', () => {
  for (let kind = 0; kind < 40; kind++) {
    let b = { ...create(never), x: 20, untilStop: 0 }
    const roll = () => kind / 40
    for (let i = 0; i < 40; i++) {
      for (const rows of [1, 2] as const) {
        const moved = step(b, i % 3 === 0, roll, rows)
        expect(moved.line).not.toContain('undefined')
        expect(moved.line.split('\n').length).toBe(rows)
        if (rows === 2) b = moved.buddy
      }
    }
  }
})

test('a finished turn makes the buddy cheer where it stands', () => {
  const b = cheer({ ...create(never), x: 17 })
  const moved = step(b, false, never, 2)
  expect(moved.buddy.x).toBe(17)
  expect(moved.line).toContain('★')
})
