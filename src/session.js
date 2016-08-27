// @flow

// A session provides a sample of state that will be fed into
// the system when events occur
export type Session<A> = {
  step: () => SessionStep<A>
}

export type SessionStep<A> = { sample: A, nextSession: Session<A> }

const sessionStep = (sample, nextSession) => ({ sample, nextSession })

// Session that yields an incrementing count at each step
export const countSession = (): Session<number> => new CountSession(0)

export class CountSession {
  count: number;

  constructor (count: number) {
    this.count = count
  }

  step (): SessionStep<number> {
    return sessionStep(this.count, new CountSession(this.count + 1))
  }
}

// Session that yields a time delta from its start time at each step
export const clockSession = (): Session<number> => new ClockSession(Date.now())

class ClockSession {
  start: number;
  time: number;

  constructor (start: number) {
    this.start = start
    this.time = Infinity
  }

  step (): SessionStep<number> {
    const t = Date.now()
    if (t < this.time) {
      this.time = t - this.start
    }
    return sessionStep(this.time, new ClockSession(this.start))
  }
}
