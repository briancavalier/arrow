import { NonOccurrence, occur } from './event'
import { curry2 } from '@most/prelude'
import { pair } from './pair'

const noop = _ => undefined

export const input = () =>
  makeInput(new SimpleInput())

const makeInput = si =>
  [x => occurs(occur(x), si), si]

const occurs = (x, input) => {
  input._value = x
  const f = input.f
  input.f = noop
  f(input)
}

class SimpleInput {
  constructor () {
    this._value = NonOccurrence
    this.f = noop
  }

  when (f) {
    this.f = f
    return () => { this.f = noop }
  }

  value () {
    return this._value
  }
}

export const eitherInput =
  curry2((ia, ib) => new InputPair(ia, ib))

class InputPair {
  constructor (ia, ib) {
    this.ia = ia
    this.ib = ib
  }

  when (f) {
    const handler = _ => f(this)
    const iaw = this.ia.when(handler)
    const ibw = this.ib.when(handler)
    return () => {
      iaw()
      ibw()
    }
  }

  value () {
    return pair(this.ia.value(), this.ib.value())
  }
}
