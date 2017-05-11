// @flow
import { describe, it } from 'mocha'
import { assertSF } from '../test'
import { countSession } from '../session'
import { pair, fst, snd } from '../pair'

import { occur, NonOccurrence, liftA2Event } from './event'
import { merge, mergeL, mergeR } from './merge'

const fail = () => {}
const eventEquals = (e1, e2) => e1.equals(e2)
const add = (a, b) => a + b

const left = x => pair(occur(x), NonOccurrence)
const right = x => pair(NonOccurrence, occur(x))

describe('merge', () => {
  describe('merge', () => {
    it('merge(f).step(t, [e, NonOccurrence]) === e', () => {
      assertSF(countSession(1),
        left,
        (t, a, b) => eventEquals(fst(a), b),
        merge(fail))
    })

    it('merge(f).step(t, [e, NonOccurrence]) === e', () => {
      assertSF(countSession(1),
        right,
        (t, a, b) => eventEquals(snd(a), b),
        merge(fail))
    })

    it('merge(f).step(t, [l, r]) === occur(f(l, r))', () => {
      assertSF(countSession(1),
        x => pair(occur(String(x)), occur(String(x + 1))),
        (t, a, b) => eventEquals(liftA2Event(add, fst(a), snd(a)), b),
        merge(add))
    })
  })

  describe('mergeL', () => {
    it('mergeL().step(t, [e, NonOccurrence]) === e', () => {
      assertSF(countSession(1),
        left,
        (t, a, b) => eventEquals(fst(a), b),
        mergeL())
    })

    it('mergeL().step(t, [NonOccurrence, e]) === e', () => {
      assertSF(countSession(1),
        right,
        (t, a, b) => eventEquals(snd(a), b),
        mergeL())
    })

    it('mergeL().step(t, [l, r]) === l', () => {
      assertSF(countSession(1),
        x => pair(occur(String(x)), occur(String(x + 1))),
        (t, a, b) => eventEquals(fst(a), b),
        mergeL())
    })
  })

  describe('mergeR', () => {
    it('mergeR().step(t, [e, NonOccurrence]) === e', () => {
      assertSF(countSession(1),
        left,
        (t, a, b) => eventEquals(fst(a), b),
        mergeR())
    })

    it('mergeR().step(t, [NonOccurrence, e]) === e', () => {
      assertSF(countSession(1),
        right,
        (t, a, b) => eventEquals(snd(a), b),
        mergeR())
    })

    it('mergeR().step(t, [l, r]) === r', () => {
      assertSF(countSession(1),
        x => pair(occur(String(x)), occur(String(x + 1))),
        (t, a, b) => eventEquals(snd(a), b),
        mergeR())
    })
  })
})
