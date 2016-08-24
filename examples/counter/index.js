import { lift, or, filter, scanl, always, pipe, accum, clockSession, run } from '../../src/index'
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

const inc = pipe(matches('.inc'), always(x => x + 1))
const dec = pipe(matches('.dec'), always(x => x - 1))

const counter = pipe(or(inc, dec), accum(0))
const runCounter = pipe(counter, lift(render), scanl(patch, patch(container, render(0))))

const log = x => console.log(x)
run(runCounter, click(document.body), clockSession(), log)
