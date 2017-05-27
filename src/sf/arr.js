export const arr = f => new Arr(f)

class Arr {
  constructor (f) {
    this.f = f
  }

  step (t, a) {
    const f = this.f
    return { value: f(a), next: this }
  }
}
