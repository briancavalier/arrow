// @flow
import { hold, pipe, mapE, unsplit, both, bothI, run, clockSession } from '../../src/index'
import { mousemove, keydown } from '../../src/dom'

const join = sep => (a, b) => a + sep + b
const render = s => document.body.innerHTML = s

const coords = pipe(mapE(e => `${e.clientX},${e.clientY}`), hold('-,-'))
const keyCode = pipe(mapE(e => e.keyCode), hold('-'))

const s = pipe(both(coords, keyCode), unsplit(join(':')))
const inputs = bothI(mousemove(document), keydown(document))

run(s, inputs, clockSession(), render)
