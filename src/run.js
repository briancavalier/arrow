import { curry3 } from '@most/prelude'

export const run = curry3((sf, sg, s) =>
  sg.when(sg => step(sf, sg, s)))

const step = (sf, sg, s) => {
  const { sample, next: nextSession } = s.step()
  const { value, next } = sf.step(sample, sg.value())
  return run(next, value, nextSession)
}
