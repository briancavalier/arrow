// @flow

// A session provides a sample of state that will be fed into
// a signal function when events occur
export type Session<A> = {
  step: () => SessionStep<A>
}

export type SessionStep<A> = {
  sample: A,
  nextSession: Session<A>
}

// Session that yields an incrementing count at each step
export const countSession = (): Session<number> => new CountSession(1)

class CountSession {
  count: number

  constructor (count: number) {
    this.count = count
  }

  step (): SessionStep<number> {
    return { sample: this.count, nextSession: new CountSession(this.count + 1) }
  }
}

// Session that yields a time delta from its start time at each step
export const clockSession = (): Session<number> => new ClockSession(Date.now())

class ClockSession {
  start: number;

  constructor (start: number) {
    this.start = start
  }

  step (): SessionStep<number> {
    return { sample: Date.now() - this.start, nextSession: new ClockSession(this.start) }
  }
}

