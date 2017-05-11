import { fst, snd } from '../pair'

export const merge = () => new Merge()

class Merge {
  step (t, es) {
    return { value: fst(es).concat(snd(es)), next: this }
  }
}
