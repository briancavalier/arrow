import { curry2 } from '@most/prelude'
import { pair, fst, snd } from '../pair'

export const first = ab => new First(ab)

class First {
  constructor (ab) {
    this.ab = ab
  }

  step (t, pac) {
    const { value: b, next: abnext } = this.ab.step(t, fst(pac))
    return { value: pair(b, snd(pac)), next: new First(abnext) }
  }
}

export const unfirst = curry2((ab, c) => new Unfirst(ab, c))

class Unfirst {
  constructor (ab, c) {
    this.ab = ab
    this.value = c
  }

  step (t, a) {
    const { value: bc, next } = this.ab.step(t, pair(a, this.value))
    return { value: fst(bc), next: new Unfirst(next, snd(bc)) }
  }
}

export const unsplit = f => new Unsplit(f)

class Unsplit {
  constructor (f) {
    this.f = f
  }

  step (t, ab) {
    const f = this.f
    return { value: f(fst(ab), snd(ab)), next: this }
  }
}
