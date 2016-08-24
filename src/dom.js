// @flow
import type { Input } from './input'

/* global Element, Event */

export type DomInput = (name: string) => (node: Element) => Input<Event>
export const domInput: DomInput = (name) => (node) => (f) => {
  node.addEventListener(name, f, false)
  return () => node.removeEventListener(name, f, false)
}

export const click = domInput('click')
export const mousemove = domInput('mousemove')
export const keydown = domInput('keydown')
