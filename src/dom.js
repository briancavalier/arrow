// @flow
import type { SignalGen } from './signalgen'
import { stepInput } from './signalgen'

/* global EventTarget, Event, requestAnimationFrame, cancelAnimationFrame */

export type DomSignalGen = (name: string) => (node: EventTarget) => SignalGen<Event>

const cancelDomEvent = ({ node, name, handler }) => node.removeEventListener(name, handler, false)

export const fromDomEvent: DomSignalGen = (name) => (node) =>
  stepInput(handler => {
    node.addEventListener(name, handler, false)
    return { node, name, handler }
  }, cancelDomEvent)

export const click = fromDomEvent('click')
export const mousemove = fromDomEvent('mousemove')
export const keydown = fromDomEvent('keydown')

export const animationFrame = stepInput(requestAnimationFrame, cancelAnimationFrame)
