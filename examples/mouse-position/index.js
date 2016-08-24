import { hold, pipe, lift, unsplit, both, bothI, run, clockSession } from '../../src/index'
import { mousemove, keydown } from '../../src/dom'

const join = sep => (a, b) => a + sep + b
const render = s => document.body.innerHTML = s

const coords = hold(lift(e => `${e.clientX},${e.clientY}`), '-,-')
const keyCode = hold(lift(e => e.keyCode), '-')

const s = pipe(both(coords, keyCode), unsplit(join(':')))
const inputs = bothI(mousemove(document), keydown(document))

run(s, inputs, clockSession(), render)
