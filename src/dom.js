// @flow
import type { Input } from './input'

/* global EventTarget, Event, requestAnimationFrame, cancelAnimationFrame */

export type DomInput = (name: string) => (node: EventTarget) => Input<Event>

export const domInput: DomInput = (name) => (node) => (f) => {
  node.addEventListener(name, f, false)
  return () => node.removeEventListener(name, f, false)
}

export const click = domInput('click')
export const mousemove = domInput('mousemove')
export const keydown = domInput('keydown')

export const animationFrames = f => {
  const handle = requestAnimationFrame(f)
  return () => cancelAnimationFrame(handle)
}
