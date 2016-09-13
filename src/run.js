// @flow
import type { Input, DisposeInput } from './input'
import type { SignalFunc } from './signal'
import type { Session } from './session'

export function run <T, A, B> (
  r: SignalFunc<T, A, B>,
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

export function loop <T, A, B> (session: Session<T>, input: Input<A>, sf: SignalFunc<T, A, [B, Input<A>]>): DisposeInput {
  let dispose = input(a => {
    const { sample, nextSession } = session.step()
    const { value: [_, nextInput], next } = sf.step(sample, a)
    dispose = switchInput(nextSession, nextInput, next, dispose)
  })

  return dispose
}

const switchInput = (session, input, sf, dispose) => {
  dispose()
  return loop(session, input, sf)
}
