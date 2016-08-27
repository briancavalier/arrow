// @flow
import { hold, pipe, lift, unsplit, both, bothI, run, clockSession } from '../../src/index'
import { mousemove, keydown } from '../../src/dom'

const join = sep => (a, b) => a + sep + b
const render = s => document.body.innerHTML = s

const coords = pipe(lift(e => `${e.clientX},${e.clientY}`), hold('-,-'))
const keyCode = pipe(lift(e => e.keyCode), hold('-'))

const s = pipe(both(coords, keyCode), unsplit(join(':')))
const inputs = bothI(mousemove(document), keydown(document))

run(s, inputs, clockSession(), render)
