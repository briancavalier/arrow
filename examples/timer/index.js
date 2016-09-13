import { lift, pipe, as, accum, or, bothI, newInput, clockSession, loop } from '../../src/index'
import { vdomUpdate } from '../../src/vdom'
import { html, init, events } from '../vdom'
const { button } = html

const container = document.getElementById('app')
const patch = init([events])

// Simple input that fires an event after ms millis
const after = ms => f => {
  const handle = setTimeout(f, ms, ms)
  return () => clearTimeout(handle)
}

// Counter component
const render = (count) => {
  const [click, reset] = newInput()
  return [
    button({ on: { click } }, `Seconds passed: ${count}`),
    bothI(reset, after(1000))
  ]
}

const inc = as((a) => a + 1)
const reset = as(() => 0)
const counter = pipe(or(reset, inc), accum(0), lift(render))

// Render initial UI and get initial inputs
const [vtree, input] = render(0)

// Append vdom updater to counter component
const update = vdomUpdate(patch, patch(container, vtree))
const updateCounter = pipe(counter, update)

// Run it
loop(clockSession(), input, updateCounter)
