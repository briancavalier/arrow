import { occurred } from './event'

export const hold = x => new Hold(x)

class Hold {
  constructor (value) {
    this.value = value
  }

  step (t, a) {
    return occurred(a)
      ? { value: a.value, next: new Hold(a.value) }
      : { value: this.value, next: this }
  }
}
