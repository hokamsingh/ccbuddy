import { test, expect } from 'claude-code/testing'

import { TRACK, create, step } from './walk'

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
