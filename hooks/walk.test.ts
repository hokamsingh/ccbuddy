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

test('the minion skin has goggle eyes, its own tricks, and never draws undefined', () => {
  const seen = new Set<string>()
  for (let kind = 0; kind < 60; kind++) {
    let b = { ...create(never), x: 20, untilStop: 0 }
    const roll = () => kind / 60
    for (let i = 0; i < 40; i++) {
      for (const rows of [1, 2] as const) {
        const moved = step(b, i % 3 === 0, roll, rows, 'minion')
        expect(moved.line).not.toContain('undefined')
        expect(moved.line).not.toContain('•')
        if (rows === 1) b = moved.buddy
        for (const word of ['bello', 'ba-na-na', 'hehe', 'tulaliloo']) {
          if (moved.line.includes(word)) seen.add(word)
        }
      }
    }
  }
  expect(seen.size).toBe(4)
  expect(step(create(never), false, never, 1, 'minion').line).toContain('◉')
})

test('the classic skin never says bello', () => {
  for (let kind = 0; kind < 60; kind++) {
    let b = { ...create(never), x: 20, untilStop: 0 }
    for (let i = 0; i < 40; i++) {
      const moved = step(b, false, () => kind / 60, 1, 'classic')
      b = moved.buddy
      expect(moved.line).not.toContain('bello')
      expect(moved.line).not.toContain('◉')
    }
  }
})

test('the Claude mascot draws block rows, its own tricks, and never undefined', () => {
  const seen = new Set<string>()
  for (let kind = 0; kind < 80; kind++) {
    let b = { ...create(never), x: 20, untilStop: 0 }
    const roll = () => kind / 80
    for (let i = 0; i < 40; i++) {
      for (const rows of [1, 2] as const) {
        const moved = step(b, i % 3 === 0, roll, rows, 'claude')
        expect(moved.line).not.toContain('undefined')
        expect(moved.line).toContain('▐')
        expect(moved.line.split('\n').length).toBe(rows + 1)
        if (rows === 1) b = moved.buddy
        for (const word of ['hi!', 'hmm?', 'ship it!']) {
          if (moved.line.includes(word)) seen.add(word)
        }
        expect(moved.line).not.toContain('bello')
      }
    }
  }
  expect(seen.size).toBe(3)
})
