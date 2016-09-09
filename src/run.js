// @flow
import type { Input, DisposeInput } from './input'
import type { Evt } from './event'
import type { Session } from './session'

export type Reactive<T, A, B> = {
  step: (t: T, a: A) => ReactiveStep<T, A, B>
}

export type ReactiveStep<T, A, B> = {
  value: B,
  next: Reactive<T, A, B>
}

export function run <T, A, B> (
  r: Reactive<T, Evt<A>, B>,
  input: Input<A>,
  session: Session<T>,
  handleOutput: (b: B) => any
): DisposeInput {
  return input(a => {
    const { sample, nextSession } = session.step()
    session = nextSession

    const { value, next } = r.step(sample, a)
    r = next

    return handleOutput(value)
  })
}

export function loop <T, A, B, C> (
  update: (c: C, b: B) => C,
  input: Input<A>,
  state: C,
  session: Session<T>,
  sf: Reactive<T, A, [Input<A>, B]>
): DisposeInput {
  let dispose = input(a => {
    const { sample, nextSession } = session.step()
    const { value: [nextInput, outputState], next } = sf.step(sample, a)

    state = update(state, outputState)

    if(nextInput !== input) {
      dispose()
      dispose = loop(update, nextInput, state, nextSession, next)
    } else {
      session = nextSession
      sf = next
    }
  })

  return () => dispose()
}


