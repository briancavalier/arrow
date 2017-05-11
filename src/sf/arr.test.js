// @flow
import { describe, it } from 'mocha'
import { simpleAssertSF } from '../test'

import { arr } from './arr'

describe('arr', () => {
  it('should lift function', () => {
    const f = x => String(x + 1)
    simpleAssertSF((t, a, b) => f(a) === b, arr(f))
  })
})
