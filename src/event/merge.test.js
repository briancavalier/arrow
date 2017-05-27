// @flow
import { describe, it } from 'mocha'
import { assertSF } from '../test'
import { countSession } from '../session'
import { pair, fst, snd } from '../pair'

import { occur, none, liftA2Event } from './event'
import { merge, mergeL, mergeR } from './merge'

const fail = () => {}
const eventEquals = (e1, e2) => e1.equals(e2)
const concat = (a, b) => a + b

const left = x => pair(occur(x), none())
const right = x => pair(none(), occur(x))
const bothString = x => pair(occur(String(x)), occur(String(x + 1)))

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
        bothString,
        (t, a, b) => eventEquals(liftA2Event(concat, fst(a), snd(a)), b),
        merge(concat))
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
        bothString,
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
        bothString,
        (t, a, b) => eventEquals(snd(a), b),
        mergeR())
    })
  })
})
