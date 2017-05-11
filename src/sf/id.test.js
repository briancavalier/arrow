// @flow

import { describe, it } from 'mocha'
import { simpleAssertSF } from '../test'

import { id } from './id'

describe('id', () => {
  it('should be identity', () => {
    simpleAssertSF((t, a, b) => a === b, id())
  })
})
