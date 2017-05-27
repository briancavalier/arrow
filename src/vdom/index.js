import { first } from '../sf/strong'
import { arr } from '../sf/arr'
import { pipe } from '../sf/compose'
import { snd } from '../pair'
import { run } from '../run'
import { curry4 } from '@most/prelude'

export const runVdom = curry4((sf, patchFunc, vnode, [vtree, inputs]) =>
  run(pipe(sf, patch(patchFunc, patchFunc(vnode, vtree))), inputs))

const patch = (p, initial) =>
  pipe(first(new Patch(p, initial)), arr(snd))

class Patch {
  constructor (patch, state) {
    this.patch = patch
    this.state = state
  }

  step (t, a) {
    const f = this.patch
    const s = f(this.state, a)
    return { value: f(this.state, a), next: new Patch(f, s) }
  }
}
