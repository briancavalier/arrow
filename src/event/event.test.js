// @flow
import { describe, it } from 'mocha'
import { assert, eq } from '@briancavalier/assert'
import { compose, id } from '@most/prelude'

import { occur, occurred, none, foldEvent, liftA2Event, mergeEvent } from './event'

const concat = (a, b) => a + b

describe('event', () => {
  describe('occurred', () => {
    it('occurred(occur(x)) === true', () => {
      assert(occurred(occur(null)))
    })

    it('occurred(none()) === false', () => {
      assert(!occurred(none()))
    })
  })
  describe('equals', () => {
    it('occur(x).equals(occur(y)) when x === y', () => {
      const x = {}
      assert(occur(x).equals(occur(x)))
    })

    it('!occur(x).equals(occur(y)) when x !== y', () => {
      assert(!occur({}).equals(occur({})))
    })
  })

  describe('map', () => {
    it('NonOccurrence.map(f) === NonOccurrence', () => {
      assert(none().map(x => 123).equals(none()))
    })

    it('e.map(id) === e', () => {
      const e = occur({})
      assert(e.map(id).equals(e))
    })

    it('e.map(f).map(g) === e.map(compose(g, f))', () => {
      const f = x => x + 'f'
      const g = x => x + 'g'
      const e = occur('e')
      assert(e.map(f).map(g).equals(e.map(compose(g, f))))
    })
  })

  describe('foldEvent', () => {
    it('x === foldEvent(x, _, NonOccurrence)', () => {
      const x = {}
      eq(x, foldEvent(x, _ => {}, none()))
    })

    it('x === foldEvent(y, x => x, occur(x))', () => {
      const x = {}
      eq(x, foldEvent({}, x => x, occur(x)))
    })
  })

  describe('liftA2Event', () => {
    it('liftA2Event(_, _, NonOccurrence) === NonOccurrence', () => {
      eq(none(), liftA2Event(concat, occur(''), none()))
    })

    it('liftA2Event(_, NonOccurrence, _) === NonOccurrence', () => {
      eq(none(), liftA2Event(concat, none(), occur('')))
    })

    it('liftA2Event(f, ea, eb) === occur(f(ea.value, eb.value))', () => {
      const l = 'l'
      const r = 'r'
      assert(liftA2Event(concat, occur(l), occur(r)).equals(occur(concat(l, r))))
    })
  })

  describe('mergeEvent', () => {
    it('mergeEvent(_, e, NonOccurrence) === e', () => {
      const e = occur('l')
      assert(mergeEvent(concat, e, none()).equals(e))
    })

    it('mergeEvent(_, NonOccurrence, e) === e', () => {
      const e = occur('r')
      assert(mergeEvent(concat, none(), e).equals(e))
    })

    it('mergeEvent(f, l, r) === occur(f(l.value, r.value))', () => {
      const l = 'l'
      const r = 'r'
      assert(mergeEvent(concat, occur(l), occur(r)).equals(occur(concat(l, r))))
    })
  })
})