// @flow
import { split, pipe, lift, unsplit, first, unfirst } from './reactive'
import { dup } from './pair'

// An event, which has a value when it occurs, and
// has no value when it doesn't occur
export type Evt<A> = A | void

type Time = number
type ReactiveT<A, B> = {
  step: (t: Time, a: A) => ReactiveStep<A, B>
}

type ReactiveStep<A, B> = {
  value: B,
  next: ReactiveT<A, B>
}

type EventT<A, B> = ReactiveT<Evt<A>, Evt<B>>

// Non-occurrence
export const NoEvent = undefined
const noEvent = (_) => NoEvent

export function never <A> (): ReactiveT<Evt<A>, Evt<A>> {
  return lift(noEvent)
}

// Turn Events of A instead Events of B
function map <A, B> (f: (a: A) => B): (a: Evt<A>) => Evt<B> {
  return a => a === undefined ? a : f(a)
}

// Return the Event that occurred, preferring a1 if both occurred
function mergeE <A> (a1: Evt<A>, a2: Evt<A>): Evt<A> {
  return a1 === undefined ? a2 : a1
}

export function mapE <A, B> (f: (a: A) => B): ReactiveT<Evt<A>, Evt<B>> {
  return lift(map(f))
}

export function as <A, B> (b: B): ReactiveT<Evt<A>, Evt<B>> {
  return mapE(_ => b)
}

export function sample <A, B> (): ReactiveT<[Evt<A>, B], Evt<[A, B]>> {
  return lift((ab) => ab[0] === undefined ? NoEvent : ab)
}

export function sampleWith <A, B, C> (f: (a: A, b: B) => C): ReactiveT<[Evt<A>, B], Evt<C>> {
  return lift(([a, b]) => a === undefined ? NoEvent : f(a, b))
}

export function sampleR <A, B> (): ReactiveT<[Evt<A>, B], Evt<B>> {
  return lift(([a, b]) => a === undefined ? NoEvent : b)
}

// Merge events, preferring the left in the case of
// simultaneous occurrence
export function merge <A> (): ReactiveT<[Evt<A>, Evt<A>], Evt<A>> {
  return unsplit(mergeE)
}

export function or <A, B> (left: EventT<A, B>, right: EventT<A, B>): EventT<A, B> {
  return pipe(split(left, right), merge())
}

export function filter <A> (p: (a: A) => boolean): EventT<A, A> {
  return lift(map(a => p(a) ? a : NoEvent))
}

// when :: Reactive t (Event a) boolean -> Reactive t (Event a) (Event a)
// Reactive transformation that yields its input when
// a predicate Reactive transform is true, and NoEvent
// when false
export function when <A> (): ReactiveT<[Evt<A>, boolean], Evt<A>> {
  return lift(([a, b]) => b ? a : NoEvent)
}

// Turn an event into a continuous (stepped) value
export function hold <A, B> (ab: ReactiveT<Evt<A>, Evt<B>>, initial: B): ReactiveT<Evt<A>, B> {
  return unfirst(pipe(first(ab), lift(([eb, b]) => eb === undefined ? [b, b] : [eb, eb])), initial)
}

// Accumulate Event carrying update functions
export function accum <A> (initial: A): ReactiveT<Evt<(a: A) => A>, Evt<A>> {
  return unfirst(lift(([f, a]) => dup(f(a))), initial)
}

// Accumulate via scan
export function scanl <A, B> (f: (b: B, a: A) => B, initial: B): ReactiveT<Evt<A>, Evt<B>> {
  return unfirst(lift(([a, b]) => dup(f(b, a))), initial)
}
