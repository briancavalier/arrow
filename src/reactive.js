import { dup, swap, uncurry } from './pair'
import * as E from './event'

const identity = a => a

// An Event is either a value or NoEvent, indicating that
// the Event did not occur
// type Event a = a | NoEvent

// A Reactive transformation turns as into bs, and may carry
// state or evolve over time
// type Reactive t a b = { step :: t -> a -> Step t a b }

// A Step is the result of applying a Reactive transformation
// to an a to get a b and a new Reactive transformation
// type Step t a b = { value :: b, next :: Reactive t a b }

// step :: b -> Reactive t a b -> Step t a b
// Simple helper to construct a Step
const step = (value, next) => ({ value, next })

const noEvent = (next) => step(E.NoEvent, next)

// lift :: (a -> b) -> Reactive t a b
// Lift a function into a Reactive transform
export const lift = f => new Lift(f)

// unsplit :: (a -> b -> c) -> Reactive t [a, b] c
export const unsplit = (f) => lift(uncurry(f))

// merge :: () -> Reactive t (Event a, Event a) (Event a)
// Merge events, preferring the left in the case of
// simultaneous occurrence
export const merge = () => unsplit(E.merge)

// always :: a -> Reactive t a a
// Reactive transformation that turns everything into a
// TODO: Give this its own type so it can be composed efficiently
export const always = (a) => lift(() => a)

class Lift {
  constructor (f) {
    this.f = f
  }

  step (t, a) {
    return a === E.NoEvent
      ? noEvent(this)
      : step(this.f(a), this)
  }
}

// id :: Reactive t a a
// Reactive transformation that yields its input at each step
// TODO: Give this its own type so it can be composed efficiently
export const id = lift(identity)

export const or = (left, right) => new Or(left, right)

class Or {
  constructor (left, right) {
    this.left = left
    this.right = right
  }

  step (t, a) {
    const { value: bl, next: nl } = this.left.step(t, a)
    const { value: br, next: nr } = this.right.step(t, a)
    return step(bl !== E.NoEvent ? bl : br, or(nl, nr))
  }
}

export const filter = (p) => lift(a => p(a) ? a : E.NoEvent)

// when :: Reactive t a boolean -> Reactive t a a
// Reactive transformation that yields its input when
// a predicate Reactive transform is true, and NoEvent
// when false
export const when = (p) => new When(p)

class When {
  constructor (p) {
    this.p = p
  }

  step (t, a) {
    const { value, next } = this.p.step(t, a)
    return step(value ? a : E.NoEvent, when(next))
  }
}

// first  :: Reactive t a b -> Reactive t [a, c] [b, c]
// second :: Reactive t a b -> Reactive t [c, a] [c, b]
// Apply a Reactive transform to the first element of a pair
export const first = (arrow) => new First(arrow)
export const second = (arrow) => first(dimap(swap, swap, arrow))

class First {
  constructor (arrow) {
    this.arrow = arrow
  }

  step (t, a) {
    return a === E.NoEvent ? E.NoEvent : stepFirst(this.arrow, t, a)
  }
}

const stepFirst = (arrow, t, [a, c]) => {
  const { value: b, next } = arrow.step(t, a)
  return step([b, c], first(next))
}

// unfirst  :: c -> Reactive [a, c] [b, c] -> Reactive a b
// unsecond :: c -> Reactive [c, a] [c, b] -> Reactive a b
// Tie a Reactive into a loop that feeds c back into itself

export const unfirst = (arrow, c) => new Unfirst(arrow, c)
export const unsecond = (arrow, c) => unfirst(dimap(swap, swap, arrow), c)

class Unfirst {
  constructor (arrow, c) {
    this.arrow = arrow
    this.value = c
  }

  step (t, a) {
    return a === E.NoEvent
      ? noEvent(this)
      : stepUnfirst(this.arrow, t, a, this.value)
  }
}

const stepUnfirst = (arrow, t, a, c1) => {
  const { value: [b, c2], next } = arrow.step(t, [a, c1])
  return step(b, unfirst(next, c2))
}

export const accum = (a) => unfirst(lift(stepAccum), a)
const stepAccum = ([f, a]) => dup(f(a))

export const scanl = (f, b) => unfirst(lift(([a, b]) => dup(f(b, a))), b)

// pipe :: (Reactive t a b ... Reactive t y z) -> Reactive t a z
// Compose many Reactive transformations, left to right
export const pipe = (ab, ...rest) => rest.reduce(pipe2, ab)

// pipe2 :: Reactive t a b -> Reactive t b c -> Reactive t a c
// Compose 2 Reactive transformations left to right
const pipe2 = (ab, bc) => new Pipe(ab, bc)

export const dimap = (fab, fcd, bc) => pipe(lift(fab), bc, lift(fcd))
export const lmap = (fab, bc) => pipe2(lift(fab), bc)
export const rmap = (fbc, ab) => pipe2(ab, lift(fbc))

class Pipe {
  constructor (ab, bc) {
    this.ab = ab
    this.bc = bc
  }

  step (t, a) {
    const { value: b, next: ab } = this.ab.step(t, a)
    const { value: c, next: bc } = this.bc.step(t, b)
    return step(c, pipe(ab, bc))
  }
}

// split :: Reactive t a b -> Reactive t a c -> Reactive t [b, c]
// Duplicates input a and pass it through Reactive transformations
// ab and ac to yield [b, c]
export const split = (ab, ac) => lmap(dup, both(ab, ac))

// both :: Reactive t a b -> Reactive t c d -> Reactive [a, b] [c, d]
// Given an [a, c] input, pass a through Reactive transformation ab and
// c through Reactive transformation cd to yield [b, d]
export const both = (ab, cd) => new Both(ab, cd)

class Both {
  constructor (ab, cd) {
    this.ab = ab
    this.cd = cd
  }

  step (t, ac) {
    return ac === E.NoEvent
      ? stepBoth(this.ab, this.cd, t, E.NoEvent, E.NoEvent)
      : stepBoth(this.ab, this.cd, t, ac[0], ac[1])
  }
}

const stepBoth = (ab, cd, t, a, c) => {
  const { value: b, next: anext } = ab.step(t, a)
  const { value: d, next: cnext } = cd.step(t, c)
  return step([b, d], both(anext, cnext))
}

// hold :: a -> Reactive t (Event a) a
// Turn an event into a stepped value
export const hold = (initial) => new Hold(initial)

export class Hold {
  constructor (value) {
    this.value = value
  }

  step (t, a) {
    return stepHold(E.merge(a, this.value))
  }
}

const stepHold = (a) => step(a, hold(a))
