// @flow
import { or, sampleR, split, lift, filter, scanl, always, pipe, clockSession, run } from '../../src/index'
import { click } from '../../src/dom'
import snabbdom from 'snabbdom'
import h from 'snabbdom/h'

const container = document.getElementById('app')

const patch = snabbdom.init([])

const render = (value) =>
  h('div#container', [
    h('button.inc', '+'),
    h('p.value', value),
    h('button.dec', '-')
  ])

const matches = (selector) => filter(e => e.target.matches(selector))

const add = (a, b) => a + b
const inc = pipe(split(matches('.inc'), always(1)), sampleR())
const dec = pipe(split(matches('.dec'), always(-1)), sampleR())

const counter = pipe(or(inc, dec), scanl(add, 0))
const runCounter = pipe(counter, lift(render), scanl(patch, patch(container, render(0))))

const log = x => console.log(x)
run(runCounter, click(document.body), clockSession(), log)

