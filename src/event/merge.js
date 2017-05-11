import { occur, NonOccurrence } from './event'
import { fst, snd } from '../pair'

export const merge = f => new Merge(f)

export const mergeL = () => merge((l, _) => l)

export const mergeR = () => merge((_, r) => r)

class Merge {
  constructor (f) {
    this.f = f
  }

  step (t, es) {
    const value = stepMerge(this.f, fst(es), snd(es))
    return { value, next: this }
  }
}

const stepMerge = (f, l, r) =>
  l === NonOccurrence ? r
    : r === NonOccurrence ? l
    : occur(f(l.value, r.value))
