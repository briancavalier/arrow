// @flow
import type { SignalFunc } from '../signal'
import type { Session } from '../session'
import { logSignal } from './show'

export function assertSF <T, A, B> (check: (t: T, a: A, b: B) => boolean, n: number, session: Session<T>, genInput: (t: T) => A, sf: SignalFunc<T, A, B>): void {
  return n <= 0
    ? Promise.resolve()
    : stepAssertSF(check, n, session, genInput, sf)
}

export function runSF <T, A, B> (session: Session<T>, genInput: (t: T) => A, sf: SignalFunc<T, A, B>): void {
  return assertSF(logSignal, Infinity, session, genInput, sf)
}

const stepAssertSF = (check, n, session, f, sf) => {
  const { sample, nextSession } = session.step()
  return Promise.resolve(f(sample))
    .then(a => stepAndCheck(check, n, nextSession, f, sf, sample, a))
}

const stepAndCheck = (check, n, nextSession, f, sf, t, a) => {
  const { value, next } = sf.step(t, a)
  return check(t, a, value)
    ? assertSF(check, n - 1, nextSession, f, next)
    : Promise.reject(new Error(`assertion failed: ${t} ${a} ${value}`))
}

