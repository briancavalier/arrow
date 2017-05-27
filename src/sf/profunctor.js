import { pipe } from './compose'
import { arr } from './arr'
import { curry2, curry3 } from '@most/prelude'

export const promap = curry3((ab, cd, bc) =>
  lmap(ab, rmap(cd, bc)))

export const lmap = curry2((ab, bc) =>
  pipe(arr(ab), bc))

export const rmap = curry2((cd, bc) =>
  pipe(bc, arr(cd)))
