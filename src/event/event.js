class NoOccurrence {
  map (f) {
    return this
  }

  concat (e) {
    return e
  }
}

export const NonOccurrence = new NoOccurrence()

export const occur = x => new Occurrence(x)

class Occurrence {
  constructor (value) {
    this.value = value
  }

  map (f) {
    return new Occurrence(f(this.value))
  }

  concat (e) {
    return e === NonOccurrence ? this : new Occurrence(this.value.concat(e.value))
  }
}
