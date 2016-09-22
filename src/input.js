// @flow
import type { Evt } from './event'
import { NoEvent } from './event'

// Dispose an Input
export type DisposeInput = () => any

// Handle input events
export type HandleInput<A> = (a: A) => any

// An Input allows events to be pushed into the system
// It's basically any unary higher order function
export type Input<A> = (handler: HandleInput<A>) => DisposeInput

export type Occur<A> = (a: A) => void

// Turn a pair of inputs into an input of pairs
export function and<A, B> (input1: Input<A>, input2: Input<B>): Input<[Evt<A>, Evt<B>]> {
  return f => {
    const dispose1 = input1(a1 => f([a1, NoEvent]))
    const dispose2 = input2(a2 => f([NoEvent, a2]))
    return () => [dispose1(), dispose2()]
  }
}

export const never: Input<any> = () => noop
const noop = () => {}

export function newInput <A> (): [Occur<A>, Input<A>] {
  let _occur = noop
  const occur = (x) => _occur(x)

  const input = (f) => {
    _occur = f
    return () => {
      _occur = noop
    }
  }

  return [occur, input]
}
