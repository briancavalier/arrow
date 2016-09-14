// @flow
import { or, as, lift, bothI, newInput, scan, pipe, clockSession, loop } from '../../src/index'
import { html, init, events, vdomPatch } from '../../src/vdom'
const { div, p, button } = html

const container = document.getElementById('app')
const patch = init([events])

const [inc, incInput] = newInput()
const [dec, decInput] = newInput()

const render = value =>
  [div('#app', [
    p(value),
    button({ on: { click: dec } }, '-'),
    button({ on: { click: inc } }, '+')
  ]), bothI(incInput, decInput)]

const add = (a, b) => a + b
const counter = pipe(or(as(1), as(-1)), scan(add, 0))

const [vtree, inputs] = render(0)
const update = vdomPatch(patch, patch(container, vtree));
const runCounter = pipe(counter, lift(render), update)

loop(clockSession(), inputs, runCounter)
