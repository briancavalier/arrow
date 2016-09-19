// @flow
import { hold, pipe, mapE, always, split, unsplit, both, bothI, loop, clockSession } from '../../src/index'
import { mousemove, keydown } from '../../src/dom'
import { html, init, vdomPatch } from '../../src/vdom'
const { div } = html

const container = document.getElementById('app')
const patch = init()

const inputs = bothI(mousemove(document), keydown(document))

const render = (pos, key) => div(`${pos.clientX},${pos.clientY}:${key}`)
const withInputs = always(inputs)

const coords = hold('-,-')
const keyCode = pipe(mapE(e => e.keyCode), hold('-'))
const mouseAndKey = pipe(both(coords, keyCode), unsplit(render))

const vtree = render({ clientX: 0, clientY: 0 }, '-')
const update = vdomPatch(patch, patch(container, vtree))

loop(clockSession(), inputs, pipe(split(mouseAndKey, withInputs), update))
