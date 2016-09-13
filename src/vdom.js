// @flow
import type { SignalFunc } from './signal'
import type { Input } from './input'
import { first } from './signal'
import { scan } from './event'

export type PatchVTree<VTree> = (orig: VTree, updated: VTree) => VTree

export function vdomUpdate <T, A, VTree> (patch: PatchVTree<VTree>, init: VTree): SignalFunc<T, [VTree, Input<A>], [VTree, Input<A>]> {
  return first(scan(patch, init))
}
