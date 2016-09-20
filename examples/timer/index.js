import { pipe, both, unsplit, time } from '../../src/signal'
import { hold, eventTime } from '../../src/event'
import { newInput, and } from '../../src/input'
import { clockSession } from '../../src/session'
import { loop } from '../../src/run'
import { html, init, events, vdomPatch } from '../../src/vdom'
const { div, p, button } = html

const container = document.getElementById('app')
const patch = init([events])

// Simple input that fires an event after ms millis
const after = ms => f => {
  const handle = setTimeout(f, ms, ms)
  return () => clearTimeout(handle)
}

// Counter component
const render = (start, now) => {
  const elapsed = now - start
  const [click, reset] = newInput()
  return [
    div([
      p(`Seconds passed: ${Math.floor(elapsed * .001)}`),
      button({ on: { click } }, `Reset`)
    ]),
    and(reset, after(1000 - (elapsed % 1000))) // account for setTimeout drift
  ]
}

const reset = pipe(eventTime, hold(0))
const counter = pipe(both(reset, time), unsplit(render))

// Render initial UI and get initial inputs
const [vtree, input] = render(0, 0)

// Append vdom updater to counter component
const update = vdomPatch(patch, patch(container, vtree))
const updateCounter = pipe(counter, update)

// Run it
loop(clockSession(), input, updateCounter)
