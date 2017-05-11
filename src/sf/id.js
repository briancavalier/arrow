export const id = () => new Id()

export class Id {
  step (t, a) {
    return { value: a, next: this }
  }
}
