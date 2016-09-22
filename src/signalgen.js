// @flow
import type { Evt } from './event'
import { NoEvent } from './event'

// A SignalGen generates values or events of a signal
export type SignalGen<A> = {
  listen: (handler: HandleInput<A>) => ForgetSG
}

// Forget all future values of a SignalGen
export type ForgetSG = {
  forget: () => void
}

// Handle events from a SignalGen
export type HandleInput<A> = (a: A) => any

// Turn a pair of inputs into an input of pairs
export function and<A, B> (input1: SignalGen<A>, input2: SignalGen<B>): SignalGen<[Evt<A>, Evt<B>]> {
  return new SGVector(input1, input2)
}

export function delay <A> (ms: number, a: A): SignalGen<Evt<A>> {
  return stepInput((f) => setTimeout(f, ms, a), clearTimeout)
}

export const never: SignalGen<any> = {
  listen () { return forgetNever }
}

const forgetNever: ForgetSG = {
  forget () {}
}

export type Occur<A> = (a: A) => void

export function signalGen <A> (): [Occur<A>, SignalGen<A>] {
  const source = new SGSource()
  return [(x) => source.handler(x), source]
}

const noop = () => {}

class SGSource<A> {
  handler: HandleInput<A>

  constructor () {
    this.handler = noop
  }

  listen (handler: HandleInput<A>): ForgetSG {
    this.handler = handler
    return new ForgetSGSource(this)
  }
}

class ForgetSGSource<A> {
  source: SGSource<A>

  constructor (source: SGSource<A>) {
    this.source = source
  }

  forget (): void {
    this.source.handler = noop
  }
}

const emptySignalVector = [NoEvent, NoEvent]

const empty = input => input instanceof SGVector ? emptySignalVector : NoEvent

class SGVector<A, B> {
  first: SignalGen<A>
  second: SignalGen<A>

  constructor (first: SignalGen<A>, second: SignalGen<B>) {
    this.first = first
    this.second = second
  }

  listen (handler: HandleInput<[Evt<A>, Evt<B>]>): ForgetSG {
    const forgetFirst = this.first.listen(a => handler([a, empty(this.second)]))
    const forgetSecond = this.second.listen(a => handler([empty(this.first), a]))
    return new ForgetSGVector(forgetFirst, forgetSecond)
  }
}

class ForgetSGVector<A, B> {
  forgetFirst: ForgetSG
  forgetSecond: ForgetSG

  constructor (forgetFirst: ForgetSG, forgetSecond: ForgetSG) {
    this.forgetFirst = forgetFirst
    this.forgetSecond = forgetSecond
  }

  forget (): void {
    this.forgetFirst.forget()
    this.forgetSecond.forget()
  }
}

export function stepInput <A, C> (set: (f: HandleInput<A>) => C, forget: (c: C) => any): SignalGen<A> {
  return new PushSG(set, forget)
}

class PushSG<A, C> {
  set: (f: HandleInput<A>) => C
  forget: (c: C) => any

  constructor(set: (f: HandleInput<A>) => C, forget: (c: C) => any) {
    this.set = set
    this.forget = forget
  }

  listen (f) {
    return new ForgetPushSG(this.forget, this.set.call(undefined, f))
  }
}

class ForgetPushSG<C> {
  _forget: (c: C) => any
  context: C

  constructor (forget: (c: C) => any, context: C) {
    this._forget = forget
    this.context = context
  }

  forget (): void {
    this._forget.call(undefined, this.context)
  }
}
