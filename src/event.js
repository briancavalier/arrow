// @flow

// An event, which has a value when it occurs, and
// has no value when it doesn't occur
export type Evt<A> = A | void

// Non-occurrence
export const NoEvent = undefined

// Turn Events of A instead Events of B
export function map <A, B> (f: (a: A) => B, a: Evt<A>): Evt<B> {
  return a === undefined ? a : f(a)
}

// Return the Event that occurred, preferring a1 if both occurred
export function merge <A> (a1: Evt<A>, a2: Evt<A>): Evt<A> {
  return a1 === undefined ? a2 : a1
}
