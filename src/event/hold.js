import { NonOccurrence } from './event'

export const hold = x => new Hold(x)

class Hold {
  constructor (value) {
    this.value = value
  }

  step (t, a) {
    return a === NonOccurrence
      ? { value: this.value, next: this }
      : { value: a.value, next: new Hold(a.value) }
  }
}
