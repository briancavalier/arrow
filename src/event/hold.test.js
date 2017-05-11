// @flow
import { describe, it } from 'mocha'
import { assertSF } from '../test'
import { countSession } from '../session'

import { occur, NonOccurrence } from './event'
import { hold } from './hold'

describe('hold', () => {
  describe('hold', () => {
    it('NonOccurrence -> hold(x) -> x', () => {
      const x = {}
      assertSF(countSession(1), _ => NonOccurrence, (t, a, b) => b === x, hold(x))
    })

    it('occur(x) -> hold(y) -> x', () => {
      const x = {}
      assertSF(countSession(1), _ => occur(x), (t, a, b) => b === x, hold({}))
    })
  })
})
