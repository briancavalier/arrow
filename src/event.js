// @flow
import type { ReactiveT, ReactiveStep, Time } from './reactive'
import { both, pipe, lift, unsplit } from './reactive'
import { snd, pair } from './pair'

// An event, which has a value when it occurs, and
// has no value when it doesn't occur
export type Evt<A> = A | void

// Event non-occurrence
export const NoEvent = undefined

// Turn Events of A instead Events of B
function map <A, B> (f: (a: A) => B): (a: Evt<A>) => Evt<B> {
  return a => a === undefined ? a : f(a)
}

// Return the Event that occurred, preferring a1 if both occurred
function mergeE <A> (a1: Evt<A>, a2: Evt<A>): Evt<A> {
  return a1 === undefined ? a2 : a1
}

// Internal helper to allow continuous value transformations to be
// applied when an event occurs
// TODO: Consider exposing this if it seems useful
function liftE <A, B> (ab: ReactiveT<A, B>): ReactiveT<Evt<A>, Evt<B>> {
  return new LiftE(ab)
}

class LiftE <A, B> {
  ab: ReactiveT<A, B>

  constructor (ab) {
    this.ab = ab
  }

  step (t: Time, a: Evt<A>): ReactiveStep<Evt<A>, Evt<B>> {
    if(a === undefined) {
      return { value: NoEvent, next: this }
    }
    const { value, next } = this.ab.step(t, a)
    return { value, next: liftE(next) }
  }
}

// Sample the current time when an event occurs
export const eventTime: ReactiveT<Evt<any>, Evt<Time>> = {
  step (t: Time, a: any): ReactiveStep<Evt<any>, Evt<Time>> {
    return { value: a === undefined ? NoEvent : t, next: this }
  }
}

// Transform event values
export function mapE <A, B> (f: (a: A) => B): ReactiveT<Evt<A>, Evt<B>> {
  return lift(map(f))
}

//
export function as <A, B> (b: B): ReactiveT<Evt<A>, Evt<B>> {
  return sample
  return mapE(_ => b)
}

export function sampleWith <A, B, C> (f: (a: A, b: B) => C): ReactiveT<[Evt<A>, B], Evt<C>> {
  return lift(([a, b]) => a === undefined ? NoEvent : f(a, b))
}

export function sample <A, B> (): ReactiveT<[Evt<A>, B], Evt<[A, B]>> {
  return sampleWith(pair)
}

export function sampleR <A, B> (): ReactiveT<[Evt<A>, B], Evt<B>> {
  return sampleWith(snd)
}

// Merge events, preferring the left in the case of
// simultaneous occurrence
export function merge <A> (): ReactiveT<[Evt<A>, Evt<A>], Evt<A>> {
  return unsplit(mergeE)
}

export function or <A, B> (left: ReactiveT<Evt<A>, Evt<B>>, right: ReactiveT<Evt<A>, Evt<B>>): ReactiveT<Evt<A>, Evt<B>> {
  return liftE(pipe(both(left, right), merge()))
}

export function filter <A> (p: (a: A) => boolean): ReactiveT<Evt<A>, Evt<B>> {
  return mapE(map(a => p(a) ? a : NoEvent))
}

// when :: Reactive t (Event a) boolean -> Reactive t (Event a) (Event a)
// Reactive transformation that yields its input when
// a predicate Reactive transform is true, and NoEvent
// when false
export function when <A> (): ReactiveT<[Evt<A>, boolean], Evt<A>> {
  return lift(([a, b]) => b ? a : NoEvent)
}

// Turn an event into a stepped continuous value
export function hold <A> (initial: A): ReactiveT<Evt<A>, A> {
  return new Hold(initial)
}

class Hold <A> {
  value: A

  constructor (value: A) {
    this.value = value
  }

  step (t: Time, a: A): ReactiveStep<Evt<A>, A> {
    if(a === undefined) {
      return { value: this.value, next: this }
    }
    return { value: a, next: hold(a) }
  }
}

// Accumulate event
export function scanE <A, B> (f: (b: B, a: A) => B, initial: B): ReactiveT<Evt<A>, Evt<B>> {
  return new Accum(f, initial)
}

// Accumulate event to a continuous value
export function scan <A, B> (f: (b: B, a: A) => B, initial: B): ReactiveT<Evt<A>, B> {
  return pipe(scanE(f, initial), hold(initial))
}

// Accumulate event, given an initial value and a update-function event
export function accumE <A> (initial: A): ReactiveT<Evt<(a: A) => A>, Evt<A>> {
  return scanE((a, f) => f(a), initial)
}

// Accumulate event to a continuous value, given an initial value and a update-function event
export function accum <A> (initial: A): ReactiveT<Evt<(a: A) => A>, A> {
  return pipe(accumE(initial), hold(initial))
}

class Accum <A, B> {
  f: (b: B, a: A) => B
  value: B

  constructor(f: (b: B, a: A) => B, value: B) {
    this.f = f
    this.value = value
  }

  step (t: Time, a: A): ReactiveStep<Evt<A>, B> {
    if(a === undefined) {
      return { value: NoEvent, next: this }
    }
    const f = this.f
    const value = f(this.value, a)
    return { value, next: new Accum(f, value) }
  }
}

