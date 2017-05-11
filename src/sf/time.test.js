// @flow
import { describe, it } from 'mocha'
import { simpleAssertSF } from '../test'

import { time } from './time'

describe('time', () => {
  it('should yield time', () => {
    simpleAssertSF((t, a, b) => t === b, time())
  })
})
