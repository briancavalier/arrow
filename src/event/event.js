import { curry3 } from '@most/prelude'

class NoOccurrence {
  map (f) {
    return this
  }

  equals (e) {
    return e === this
  }

  // istanbul ignore next
  toString () {
    return 'NonOccurrence'
  }
}

export const NonOccurrence = new NoOccurrence()

export const occur = x => new Occurrence(x)

export const foldEvent = curry3((x, f, e) =>
  e === NonOccurrence ? x : f(e.value))

export const liftA2Event = curry3((f, e1, e2) =>
  e1 === NonOccurrence || e2 === NonOccurrence
    ? NonOccurrence
    : occur(f(e1.value, e2.value)))

export const mergeEvent = curry3((f, l, r) =>
  l === NonOccurrence ? r
    : r === NonOccurrence ? l
    : occur(f(l.value, r.value)))

class Occurrence {
  constructor (value) {
    this.value = value
  }

  map (f) {
    return new Occurrence(f(this.value))
  }

  equals (e) {
    return e !== NoOccurrence && e.value === this.value
  }

  // istanbul ignore next
  toString () {
    return `Occurrence ${this.value}`
  }
}
