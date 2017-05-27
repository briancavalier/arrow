export const always = a => new Always(a)

export class Always {
  constructor (value) {
    this.value = value
    this.next = this
  }

  step (t, a) {
    return this
  }
}
