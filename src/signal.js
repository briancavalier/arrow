// @flow
import { dup, swap, uncurry } from './pair'

export type Time = number

// Signal Function is a time varying transformation that
// turns Signals of A into Signals of B.  It may carry state
// and evolve over time
export type SignalFunc<T, A, B> = {
  step: (t: T, a: A) => SignalStep<T, A, B>
}

// A Step is the result of applying a SignalFunc
// to an A to get a B and a new SignalFunc
export type SignalStep<T, A, B> = {
  value: B,
  next: SignalFunc<T, A, B>
}

// SignalFunc specialized for Time type
// Note: Flow can't infer generics, IOW, it can't info the
// type T *later* based on the Session type provided when running
// a SignalFunc.  Flow needs to be able to determine T at the
// instant a SignalFunc is created, but the type is only known
// later when a Session is used to run the SignalFunc
export type SFTime<A, B> = SignalFunc<Time, A, B>

// SignalStep specialized for Time type
// re: Flow, similarly
export type StepTime<A, B> = SignalStep<Time, A, B>

// Simple helper to construct a Step
const step = (value, next) => ({ value, next })

export const time: SFTime<any, Time> =
  { step: (value, _) => ({ value, next: time }) }

// Lift a function into a SignalFunc
export function lift <A, B> (f: (a: A) => B): SFTime<A, B> {
  return new Lift(f)
}

// Combine a pair of signals into a signal of C
export function unsplit <A, B, C> (f: (a: A, b: B) => C): SFTime<[A, B], C> {
  return lift(uncurry(f))
}

// SignalFunc that runs any signal into a signal whose
// value is always a
// TODO: Give this its own type so it can be composed efficiently
export function always <A> (a: A): SFTime<any, A> {
  return lift(constant(a))
}

function identity <A> (a: A): A {
  return a
}

function constant <A> (a: A): (b?: any) => A {
  return (_) => a
}

class Lift<A, B> {
  f: (a: A) => B

  constructor (f: (a: A) => B) {
    this.f = f
  }

  step (t: Time, a: A): StepTime<A, B> {
    return step(this.f(a), this)
  }
}

// id :: SFTime a a
// Reactive transformation that yields its input at each step
// TODO: Give this its own type so it can be composed efficiently
export function id <A> (): SFTime<A, A> {
  return lift(identity)
}

// first  :: SFTime a b -> SFTime [a, c] [b, c]
// Apply a SignalFunc to the first signal of a pair
export function first <A, B, C> (ab: SFTime<A, B>): SFTime<[A, C], [B, C]> {
  return new First(ab)
}

// second :: SFTime a b -> SFTime [c, a] [c, b]
export function second <A, B, C> (ab: SFTime<A, B>): SFTime<[C, A], [C, B]> {
  return dimap(swap, swap, first(ab))
}

class First<A, B, C> {
  ab: SFTime<A, B>

  constructor (ab: SFTime<A, B>) {
    this.ab = ab
  }

  step (t: Time, [a, c]: [A, C]): StepTime<[A, C], [B, C]> {
    const { value: b, next } = this.ab.step(t, a)
    return step([b, c], first(next))
  }
}

// unfirst  :: c -> Reactive [a, c] [b, c] -> Reactive a b
// unsecond :: c -> Reactive [c, a] [c, b] -> Reactive a b
// Tie a Reactive into a loop that feeds c back into itself
export function unfirst <A, B, C> (ab: SFTime<[A, C], [B, C]>, c: C): SFTime<A, B> {
  return new Unfirst(ab, c)
}
// export const unsecond = (arrow, c) => unfirst(dimap(swap, swap, arrow), c)

class Unfirst<A, B, C> {
  ab: SFTime<[A, C], [B, C]>
  value: C

  constructor (ab: SFTime<[A, C], [B, C]>, c: C) {
    this.ab = ab
    this.value = c
  }

  step (t: Time, a: A): StepTime<A, B> {
    const { value: [b, c], next } = this.ab.step(t, [a, this.value])
    return step(b, unfirst(next, c))
  }
}

// pipe :: (SFTime a b ... SFTime y z) -> SFTime a z
// Compose many Reactive transformations, left to right
export const pipe = (ab, ...rest) => rest.reduce(pipe2, ab)

// pipe2 :: SFTime a b -> SFTime b c -> SFTime a c
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

// split :: SFTime a b -> SFTime a c -> SFTime [b, c]
// Duplicates input a and pass it through Reactive transformations
// ab and ac to yield [b, c]
export const split = (ab, ac) => lmap(dup, both(ab, ac))

// both :: SFTime a b -> SFTime c d -> Reactive [a, b] [c, d]
// Given an [a, c] input, pass a through Reactive transformation ab and
// c through Reactive transformation cd to yield [b, d]
export const both = (ab, cd) => new Both(ab, cd)

class Both {
  constructor (ab, cd) {
    this.ab = ab
    this.cd = cd
  }

  step (t, [a, c]) {
    const { value: b, next: anext } = this.ab.step(t, a)
    const { value: d, next: cnext } = this.cd.step(t, c)
    return step([b, d], both(anext, cnext))
  }
}
