// @flow
import { describe, it } from 'mocha'
import { simpleAssertSF } from '../test'

import { always } from './always'

describe('always', () => {
  it('should be constant', () => {
    simpleAssertSF((t, a, b) => b === 'test', always('test'))
  })
})
