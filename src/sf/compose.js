import { Id } from './id'
import { Always } from './always'
import { Time } from './time'
import { curry2 } from '@most/prelude'

export const compose = curry2((ab, bc) => compose2(bc, ab))
export const pipe = curry2((ab, bc) => compose2(bc, ab))

const compose2 = (bc, ab) =>
  bc instanceof Always ? bc
    : bc instanceof Time ? bc
    : bc instanceof Id ? ab
    : ab instanceof Id ? bc
    : new Compose(bc, ab)

class Compose {
  constructor (bc, ab) {
    this.ab = ab
    this.bc = bc
  }

  step (t, a) {
    const { value: b, next: ab } = this.ab.step(t, a)
    const { value: c, next: bc } = this.bc.step(t, b)
    return { value: c, next: new Compose(bc, ab) }
  }
}
