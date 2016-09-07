// @flow
import { or, as, bothI, newInput, lift, scanE, pipe, clockSession, run } from '../../src/index'
import snabbdom from 'snabbdom'
import events from 'snabbdom/modules/eventlisteners'
import h from 'snabbdom/h'

const container = document.getElementById('app')

const patch = snabbdom.init([events])

const [incClick, incInput] = newInput()
const [decClick, decInput] = newInput()

const render = (value) =>
  h('div#container', [
    h('button.inc', { on: { click: incClick } }, '+'),
    h('p.value', value),
    h('button.dec', { on: { click: decClick } }, '-')
  ])

const add = (a, b) => a + b
const counter = pipe(or(as(1), as(-1)), scanE(add, 0))
const update = pipe(lift(render), scanE(patch, patch(container, render(0))))
const runCounter = pipe(counter, update)

const log = x => console.log(x)
run(runCounter, bothI(incInput, decInput), clockSession(), log)

