// @flow
import { hold, pipe, mapE, unsplit, both, bothI, loop, clockSession } from '../../src/index'
import { mousemove, keydown } from '../../src/dom'
import { html, init, events, vdomPatch } from '../../src/vdom'
const { div } = html

const container = document.getElementById('app')
const patch = init([events])

const mouse = mousemove(document)
const keyDown = keydown(document)

const render = (pos, key) => [
  div(`${pos.clientX},${pos.clientY}:${key}`),
  bothI(mouse, keyDown)
]

const coords = hold('-,-')
const keyCode = pipe(mapE(e => e.keyCode), hold('-'))
const mouseAndKey = pipe(both(coords, keyCode), unsplit(render))

const [vtree, input] = render({ clientX: 0, clientY: 0 }, '-')
const update = vdomPatch(patch, patch(container, vtree))

loop(clockSession(), input, pipe(mouseAndKey, update))
