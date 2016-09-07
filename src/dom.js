// @flow
import type { Input } from './input'
import { schedule } from './input'

/* global EventTarget, Event */

export type DomInput = (name: string) => (node: EventTarget) => Input<Event>

export const domInput: DomInput = (name) => (node) => (f) => {
  node.addEventListener(name, f, false)
  return () => node.removeEventListener(name, f, false)
}

export const click = domInput('click')
export const mousemove = domInput('mousemove')
export const keydown = domInput('keydown')

export const animationFrames = schedule(cancelAnimationFrame, requestAnimationFrame)
