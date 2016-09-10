// @flow
import { dup, swap, uncurry } from './pair'

export type Time = number

export type ReactiveT<A, B> = {
  step: (t: Time, a: A) => ReactiveStep<A, B>
}

export type ReactiveStep<A, B> = {
  value: B,
  next: ReactiveT<A, B>
}

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

export const time: ReactiveT<any, Time> =
  { step: (value, _) => ({ value, next: time }) }

// lift :: (a -> b) -> Reactive t a b
// Lift a function into a Reactive transform
export function lift <A, B> (f: (a: A) => B): ReactiveT<A, B> {
  return new Lift(f)
}

// unsplit :: (a -> b -> c) -> Reactive t [a, b] c
export function unsplit <A, B, C> (f: (a: A, b: B) => C): ReactiveT<[A, B], C> {
  return lift(uncurry(f))
}

// always :: a -> Reactive t a a
// Reactive transformation that turns everything into a
// TODO: Give this its own type so it can be composed efficiently
export function always <A> (a: A): ReactiveT<any, A> {
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

  step (t: Time, a: A): ReactiveStep<A, B> {
    return step(this.f(a), this)
  }
}

// id :: Reactive t a a
// Reactive transformation that yields its input at each step
// TODO: Give this its own type so it can be composed efficiently
export function id <A> (): ReactiveT<A, A> {
  return lift(identity)
}

// first  :: Reactive t a b -> Reactive t [a, c] [b, c]
// Apply a Reactive transform to the first element of a pair
export function first <A, B, C> (ab: ReactiveT<A, B>): ReactiveT<[A, C], [B, C]> {
  return new First(ab)
}

// second :: Reactive t a b -> Reactive t [c, a] [c, b]
export function second <A, B, C> (ab: ReactiveT<A, B>): ReactiveT<[C, A], [C, B]> {
  return dimap(swap, swap, first(ab))
}

class First<A, B, C> {
  ab: ReactiveT<A, B>

  constructor (ab: ReactiveT<A, B>) {
    this.ab = ab
  }

  step (t: Time, [a, c]: [A, C]): ReactiveStep<[A, C], [B, C]> {
    const { value: b, next } = this.ab.step(t, a)
    return step([b, c], first(next))
  }
}

// unfirst  :: c -> Reactive [a, c] [b, c] -> Reactive a b
// unsecond :: c -> Reactive [c, a] [c, b] -> Reactive a b
// Tie a Reactive into a loop that feeds c back into itself
export function unfirst <A, B, C> (ab: ReactiveT<[A, C], [B, C]>, c: C): ReactiveT<A, B> {
  return new Unfirst(ab, c)
}
// export const unsecond = (arrow, c) => unfirst(dimap(swap, swap, arrow), c)

class Unfirst<A, B, C> {
  ab: ReactiveT<[A, C], [B, C]>
  value: C

  constructor (ab: ReactiveT<[A, C], [B, C]>, c: C) {
    this.ab = ab
    this.value = c
  }

  step (t: Time, a: A): ReactiveStep<A, B> {
    const { value: [b, c], next } = this.ab.step(t, [a, this.value])
    return step(b, unfirst(next, c))
  }
}

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

  step (t, [a, c]) {
    const { value: b, next: anext } = this.ab.step(t, a)
    const { value: d, next: cnext } = this.cd.step(t, c)
    return step([b, d], both(anext, cnext))
  }
}
