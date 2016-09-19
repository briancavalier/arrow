import { newInput, never, time, mapE, or, both, eventTime, unsplit, pipe, accum, clockSession, bothI, loop } from '../../src/index'
import { animationFrame } from '../../src/dom'
import { html, init, events, attrs, clss, vdomPatch } from '../../src/vdom'
const { div, span, ol, li, button } = html

// TODO: combining many inputs and signals. Need a better way
const anyInput = (...inputs) => inputs.reduce(bothI)
const anySignal = (...signals) => signals.reduce(or)

const container = document.getElementById('app')
const patch = init([events, attrs, clss])

const [start, startInput] = newInput()
const [stop, stopInput] = newInput()
const [reset, resetInput] = newInput()
const [lap, lapInput] = newInput()

const timerInputs = anyInput(startInput, stopInput, resetInput, lapInput)
const stoppedInputs = anyInput(timerInputs, never)
const runningInputs = anyInput(timerInputs, animationFrame)

// Render timer using current time
// Returns [inputs, vtree]
const render = (timer, time) => {
  const elapsed = timerElapsed(time, timer)
  const zero = elapsed === 0
  const vtree = div('.timer', { class: { running: timer.running, zero } }, [
    div('.elapsed', renderDuration(elapsed)),
    div('.lap-elapsed', renderDuration(timerCurrentLap(time, timer))),
    button('.reset', { on: { click: reset }, attrs: { disabled: timer.running || zero } }, 'Reset'),
    button('.start', { on: { click: start } }, 'Start'),
    button('.stop', { on: { click: stop } }, 'Stop'),
    button('.lap', { on: { click: lap }, attrs: { disabled: !timer.running } }, 'Lap'),
    ol('.laps', { attrs: { reversed: true } }, timer.laps.map(({ start, end }) =>
      li(renderDuration(end - start)))
    )
  ])

  return [vtree, timer.running ? runningInputs : stoppedInputs]
}

// Timer formatting
const renderDuration = ms => [
  span('.minutes', `${mins(ms)}`),
  span('.seconds', `${secs(ms)}`),
  span('.hundredths', `${hundredths(ms)}`)
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
const timerLastLapEnd = laps => laps.length === 0 ? 0 : laps[0].end
const timerCurrentLap = (time, { running, origin, total, laps }) => timerTotal(origin, total, time) - timerLastLapEnd(laps)
const timerElapsed = (time, { origin, total }) => timerTotal(origin, total, time)
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
const displayTimer = unsplit(render)

const [vtree, inputs] = render(timerZero, 0)
const updateTimer = pipe(runTimer, displayTimer, vdomPatch(patch, patch(container, vtree)))

loop(clockSession(), inputs, updateTimer)
