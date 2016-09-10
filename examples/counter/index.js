// @flow
import { or, as, lift, bothI, newInput, scan, pipe, clockSession, loop } from '../../src/index'
import { vdomUpdate } from '../../src/vdom'
import snabbdom from 'snabbdom'
import events from 'snabbdom/modules/eventlisteners'
import h from 'snabbdom/h'

const container = document.getElementById('app')
const patch = snabbdom.init([events])

const [inc, incInput] = newInput()
const [dec, decInput] = newInput()

const render = (value) =>
  [h('div#app', [
    h('p', value),
    h('button', { on: { click: dec } }, '-'),
    h('button', { on: { click: inc } }, '+')
  ]), bothI(incInput, decInput)]

const add = (a, b) => a + b
const counter = pipe(or(as(1), as(-1)), scan(add, 0))

const [vtree, inputs] = render(0)
const update = vdomUpdate(patch, patch(container, vtree));
const runCounter = pipe(counter, lift(render), update)

loop(clockSession(), inputs, runCounter)
