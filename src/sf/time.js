export const time = () => new Time()

export class Time {
  step (t, a) {
    return { value: t, next: this }
  }
}
