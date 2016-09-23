// @flow
import type { SignalGen, ForgetSG } from './input'
import type { SignalFunc } from './signal'
import type { Session } from './session'

export function loop <T, A, B> (session: Session<T>, input: SignalGen<A>, sf: SignalFunc<T, A, [B, SignalGen<A>]>): ForgetSG {
  let forget = input.listen(a => {
    const { sample, nextSession } = session.step()
    const { value: [_, nextInput], next } = sf.step(sample, a) // eslint-disable-line no-unused-vars
    forget = switchInput(nextSession, nextInput, next, forget)
  })

  return forget
}

const switchInput = (session, input, sf, forget) => {
  forget.forget()
  return loop(session, input, sf)
}
