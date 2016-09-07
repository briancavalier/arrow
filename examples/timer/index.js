import { lift, pipe, as, accum, scan, or, bothI, run, clockSession } from '../../src/index'
import { click } from '../../src/dom'
import snabbdom from 'snabbdom'
import h from 'snabbdom/h'

const container = document.getElementById('app')

const timer = (ms) => (f) => {
  const i = setInterval(f, ms)
  return () => clearInterval(i)
}

const patch = snabbdom.init([])

const render = (count) =>
  h('button', `Seconds passed: ${count}`)

const inc = as((a) => a + 1)
const reset = as(() => 0)

const inputs = bothI(timer(1000), click(container.parentElement))
const counter = pipe(or(inc, reset), accum(0), lift(render), scan(patch, patch(container, render(0))))

run(counter, inputs, clockSession(), x => console.log(x))
