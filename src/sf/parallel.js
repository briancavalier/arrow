import { curry2 } from '@most/prelude'
import { pair, fst, snd } from '../pair'

export const parallel = curry2((ab, cd) => new Parallel(ab, cd))

class Parallel {
  constructor (ab, cd) {
    this.ab = ab
    this.cd = cd
  }

  step (t, ac) {
    const { value: b, next: anext } = this.ab.step(t, fst(ac))
    const { value: d, next: cnext } = this.cd.step(t, snd(ac))
    return { value: pair(b, d), next: new Parallel(anext, cnext) }
  }
}
