import { expect, test } from 'vitest'
import { sum } from './sum.js'
import { ride } from './ride.js'

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3)
})

test('ride 1 * 2 to equal 2', () => {
  expect(ride(1, 2)).toBe(2)
})
