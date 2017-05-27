import { elementToVNode, init, p } from 'mostly-dom'
import { runVdom } from '../../src/vdom'
import { input, time, arr, pipe, run, clockSession } from '../../src'

const after = ms => {
  const [f, t] = input()
  setTimeout(f, ms)
  return t
}

const vnode = elementToVNode(document.getElementById('app'))
const patch = init([])

const tick = t => [
  p(`${t}`),
  after(1000)
]

const clock = pipe(time(), arr(tick))

runVdom(clock, patch, vnode, tick(0))(clockSession())
