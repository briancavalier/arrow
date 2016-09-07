import { newInput, never, time, id, split, merge, mapE, or, both, eventTime, unsplit, pipe, scan, accum, lift, clockSession, bothI, loop } from '../../src/index'
import { animationFrames } from '../../src/dom'
import snabbdom from 'snabbdom'
import events from 'snabbdom/modules/eventlisteners'
import clss from 'snabbdom/modules/class'
import h from 'snabbdom/h'

const log = lift(x => (console.log(x), x))
const anyInput = (...inputs) => inputs.reduce(bothI)
const anySignal = (...signals) => signals.reduce(or)

const container = document.getElementById('app')
const patch = snabbdom.init([events, clss])

const [start, startInput] = newInput()
const [stop, stopInput] = newInput()
const [reset, resetInput] = newInput()

const render = (timer, time) =>
  h('div.timer', { class: { running: timer.running } }, [
    h('span', `${formatElapsed(timerElapsed(time, timer))}`),
    h('button.start', { on: { click: start } }, 'Start'),
    h('button.stop', { on: { click: stop } }, 'Stop'),
    h('button.reset', { on: { click: reset } }, 'Reset')
  ])

// Timer formatting
const formatElapsed = ms =>
  `${mins(ms)}:${secs(ms)}:${hundredths(ms)}`

const mins = ms => pad((ms / (1000 * 60)) % 60)
const secs = ms => pad((ms / 1000) % 60)
const hundredths = ms => pad((ms / 10) % 100)
const pad = n => n < 10 ? `0${Math.floor(n)}` : `${Math.floor(n)}`

// Timer functions
const timerStart = time => ({ total }) => ({ running: true, origin: time, total })
const timerStop = time => ({ origin, total }) => ({ running: false, origin, total: total + (time - origin) })
const timerReset = time => ({ running }) => ({ running, origin: time, total: 0 })
const timerZero = () => ({ running: false, origin: 0, total: 0 })
const timerElapsed = (time, { running, origin, total }) => running ? (total + time - origin) : total

// Timer events: start, stop, reset, each tagged with its occurrence time
const doStart = pipe(eventTime, mapE(timerStart))
const doStop = pipe(eventTime, mapE(timerStop))
const doReset = pipe(eventTime, mapE(timerReset))

// An interactive timer that responds to start, stop, and reset events
// by changing (i.e. accumulating) state
const timer = pipe(anySignal(doStart, doStop, doReset), accum(timerZero()))

// Pair an interactive timer, with the (continuous) current time
const runTimer = both(timer, time)

// TODO: This is gross.  Need a better way to support vdom integration
const tap = ab => pipe(split(id(), ab), merge())
const displayTimer = tap(pipe(unsplit(render), scan(patch, patch(container, render(timerZero(), 0)))));

const update = pipe(runTimer, displayTimer)

loop(update, anyInput(startInput, stopInput, resetInput, never), clockSession(), ([{ running }]) => {
  return anyInput(startInput, stopInput, resetInput, running ? animationFrames : never)
})
