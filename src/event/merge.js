import { mergeEvent } from './event'
import { fst, snd } from '../pair'

export const merge = f => new Merge(f)

export const mergeL = () => merge((l, _) => l)

export const mergeR = () => merge((_, r) => r)

class Merge {
  constructor (f) {
    this.f = f
  }

  step (t, es) {
    const value = mergeEvent(this.f, fst(es), snd(es))
    return { value, next: this }
  }
}
