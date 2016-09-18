// @flow

// A session provides a sample of state that will be fed into
// a signal function when events occur
export type Session<A> = {
  step: () => SessionStep<A>
}

export type SessionStep<A> = { sample: A, nextSession: Session<A> }

export function newSession <A> (step: (a: A) => A, init: A): Session<A> {
  return new SteppedSession(step, init)
}

// Session that yields an incrementing count at each step
export const countSession = (): Session<number> => newSession(n => n + 1, 0)

class SteppedSession<A> {
  _step: (a: A) => A
  value: A

  constructor (step: (a: A) => A, value: A) {
    this._step = step
    this.value = value
  }

  step (): SessionStep<A> {
    const sample = this._step(this.value)
    return { sample, nextSession: newSession(this._step, sample) }
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
    return { sample: this.time, nextSession: new ClockSession(this.start) }
  }
}
