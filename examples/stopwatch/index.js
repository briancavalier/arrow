import { newInput, never, time, id, split, merge, mapE, or, both, eventTime, unsplit, pipe, scan, accum, clockSession, bothI, loop } from '../../src/index'
import { animationFrames } from '../../src/dom'
import snabbdom from 'snabbdom'
import events from 'snabbdom/modules/eventlisteners'
import attrs from 'snabbdom/modules/attributes'
import clss from 'snabbdom/modules/class'
import h from 'snabbdom/h'

// TODO: combining many inputs and signals. Need a better way
const anyInput = (...inputs) => inputs.reduce(bothI)
const anySignal = (...signals) => signals.reduce(or)

const container = document.getElementById('app')
const patch = snabbdom.init([events, attrs, clss])

const [start, startInput] = newInput()
const [stop, stopInput] = newInput()
const [reset, resetInput] = newInput()
const [lap, lapInput] = newInput()

const render = (timer, time) => {
  const elapsed = timerElapsed(time, timer)
  const zero = elapsed === 0
  return h('div.timer', { class: { running: timer.running, zero } }, [
    h('div.elapsed', renderDuration(elapsed)),
    h('div.lap-elapsed', renderDuration(timerCurrentLap(time, timer))),
    h('button.reset', { on: { click: reset }, attrs: { disabled: timer.running || zero } }, 'Reset'),
    h('button.start', { on: { click: start } }, 'Start'),
    h('button.stop', { on: { click: stop } }, 'Stop'),
    h('button.lap', { on: { click: lap }, attrs: { disabled: !timer.running } }, 'Lap'),
    h('ol.laps', { attrs: { reversed: true } }, timerLaps(timer).map(({ start, end }) =>
      h('li', renderDuration(end - start)))
    )
  ])
}

// Timer formatting
const renderDuration = ms => [
  h('span.minutes', `${mins(ms)}`),
  h('span.seconds', `${secs(ms)}`),
  h('span.hundredths', `${hundredths(ms)}`)
]

const mins = ms => pad((ms / (1000 * 60)) % 60)
const secs = ms => pad((ms / 1000) % 60)
const hundredths = ms => pad((ms / 10) % 100)
const pad = n => n < 10 ? `0${Math.floor(n)}` : `${Math.floor(n)}`

// Timer functions
const timerZero = ({ running: false, origin: 0, total: 0, laps: [] })
const timerReset = time => (_) => ({ running: false, origin: time, total: 0, laps: [] })

const timerStart = time => ({ total, laps }) =>
  ({ running: true, origin: time, total, laps })
const timerStop = time => ({ origin, total, laps }) =>
  ({ running: false, origin: time, total: timerTotal(origin, total, time), laps })
const timerLap = time => ({ running, origin, total, laps }) =>
  ({ running, origin, total, laps: timerAddLap(timerTotal(origin, total, time), laps) })

const timerAddLap = (end, laps) => [{ start: timerLastLapEnd(laps), end }].concat(laps)
const timerLaps = ({ laps }) => laps
const timerLastLapEnd = laps => laps.length === 0 ? 0 : laps[0].end
const timerCurrentLap = (time, { running, origin, total, laps }) => timerTotal(origin, total, time) - timerLastLapEnd(laps)
const timerElapsed = (time, { running, origin, total }) => timerTotal(origin, total, time)
const timerTotal = (origin, total, time) => total + (time - origin)

// Timer events, each tagged with its occurrence time
const doStart = pipe(eventTime, mapE(timerStart))
const doStop = pipe(eventTime, mapE(timerStop))
const doReset = pipe(eventTime, mapE(timerReset))
const doLap = pipe(eventTime, mapE(timerLap))

// An interactive timer that responds to start, stop, reset, and lap events
// by changing (i.e. accumulating) state
const timer = pipe(anySignal(doStart, doStop, doReset, doLap), accum(timerZero))

// Pair an interactive timer, with the (continuous) current time
const runTimer = both(timer, time)

// TODO: This is gross.  Need a better way to support vdom integration
const tap = ab => pipe(split(id(), ab), merge())
const displayTimer = tap(pipe(unsplit(render), scan(patch, patch(container, render(timerZero, 0)))));

const update = pipe(runTimer, displayTimer)

const timerInputs = anyInput(startInput, stopInput, resetInput, lapInput)
const stoppedInputs = anyInput(timerInputs, never)
const runningInputs = anyInput(timerInputs, animationFrames)

loop(update, stoppedInputs, clockSession(),
  ([{ running }]) => running ? runningInputs : stoppedInputs)
