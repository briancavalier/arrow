import { curry2 } from '@most/prelude'

export const dup = a => pair(a, a)

export const pair = curry2((a, b) => [a, b])

export const fst = pair => pair[0]

export const snd = pair => pair[1]

export const swap = ab => pair(snd(ab), fst(ab))
