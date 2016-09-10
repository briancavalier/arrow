// @flow
import type { ReactiveT } from './reactive'
import type { Input } from './input'
import { first } from './reactive'
import { scan } from './event'

export type PatchVTree<VTree> = (orig: VTree, updated: VTree) => VTree

export function vdomUpdate <A, VTree> (patch: PatchVTree<VTree>, init: VTree): ReactiveT<[VTree, Input<A>], [VTree, Input<A>]> {
  return first(scan(patch, init))
}
