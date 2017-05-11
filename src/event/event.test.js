// @flow
import { describe, it } from 'mocha'
import assert from 'assert'

import { occur, foldEvent, NonOccurrence } from './event'

describe('event', () => {
  it('x === foldEvent(x, _, NonOccurrence)', () => {
    const x = {}
    assert(x === foldEvent(x, _ => {}, NonOccurrence))
  })

  it('x === foldEvent(y, x => x, occur(x))', () => {
    const x = {}
    assert(x === foldEvent({}, x => x, occur(x)))
  })
})
