// @flow
import { pipe, always, split, unsplit, both } from '../../src/signal'
import { hold, map } from '../../src/event'
import { and } from '../../src/input'
import { countSession } from '../../src/session'
import { loop } from '../../src/run'
import { mousemove, keydown } from '../../src/dom'
import { html, init, vdomPatch } from '../../src/vdom'
const { span } = html

const container = document.getElementById('app')
const patch = init()

const inputs = and(mousemove(document), keydown(document))

const render = (pos, key) => span(`${pos.clientX},${pos.clientY}:${key}`)
const withInputs = always(inputs)

const coords = hold('-,-')
const keyCode = pipe(map(e => e.keyCode), hold('-'))
const mouseAndKey = pipe(both(coords, keyCode), unsplit(render))

const update = vdomPatch(patch, patch(container, span('move the mouse and press some keys')))

loop(countSession(), inputs, pipe(split(mouseAndKey, withInputs), update))
