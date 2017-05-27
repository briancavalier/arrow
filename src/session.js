const sessionStep = (sample, next) => ({ sample, next })

// Session that yields an incrementing count
export const countSession = delta =>
  new CountSession(delta, 0)

class CountSession {
  constructor (delta, count) {
    this.delta = delta
    this.count = count
  }

  step () {
    return sessionStep(this.count, new CountSession(this.delta, this.count + this.delta))
  }
}

// Session that yields time delta from the instant
// it is created
export const clockSession = () =>
  new ClockDeltaSession(Date.now, Date.now())

class ClockDeltaSession {
  constructor (now, start) {
    this.now = now
    this.start = start
  }

  step () {
    const now = this.now
    return sessionStep(now() - this.start, new ClockDeltaSession(now, this.start))
  }
}
