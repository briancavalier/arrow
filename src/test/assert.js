import { curry4 } from '@most/prelude'
import { countSession } from '../session'

const stepAssertSF = (n, assert, sf, f, s) => {
  if (n === 0) {
    return true
  }

  const { sample, next: nextSession } = s.step()
  const a = f(sample)
  const { value, next } = sf.step(sample, a)

  if (!assert(sample, a, value)) {
    throw new Error(`assert failed: ${sample}: ${a} -> ${value}`)
  }

  return stepAssertSF(n - 1, assert, next, f, nextSession)
}

export const assertSF = curry4((s, f, assert, sf) =>
  stepAssertSF(1000, assert, sf, f, s))

export const simpleAssertSF = assertSF(countSession(1), x => x)
