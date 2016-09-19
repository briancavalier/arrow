// @flow
import type { SignalFunc } from '../signal'
import type { Session } from '../session'
import { logSignal } from './show'

export function assertSF <T, A, B> (check: (t: T, a: A, b: B) => boolean, n: number, session: Session<T>, genInput: (t: T) => A, sf: SignalFunc<T, A, B>): Promise<void> {
  return stepAssertSF(check, n, session, genInput, sf)
}

export function runSF <T, A, B> (session: Session<T>, genInput: (t: T) => A, sf: SignalFunc<T, A, B>): Promise<void> {
  return stepAssertSF(logSignal, Infinity, session, genInput, sf)
}

const stepAssertSF = (check, n, session, f, sf) => {
  if(n <= 0) {
    return Promise.resolve()
  }
  const { sample, nextSession } = session.step()
  return Promise.resolve(sample).then(t =>
    stepAndCheck(check, n, nextSession, f, sf, t, f(t)))
}

const stepAndCheck = (check, n, nextSession, f, sf, t, a) => {
  const { value: b, next } = sf.step(t, a)
  return check(t, a, b)
      ? stepAssertSF(check, n - 1, nextSession, f, next)
      : Promise.reject(new Error(`assertion failed: ${t} ${a} ${b}`))
}

