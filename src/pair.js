// @flow

// Turn a single value into a pair
export function dup <A> (a: A): [A, A] {
  return pair(a, a)
}

export function pair <A, B> (a: A, b: B): [A, B] {
  return [a, b]
}

// swap the contents of a pair
export function swap <A, B> ([a, b]: [A, B]): [B, A] {
  return [b, a]
}

export function uncurry <A, B, C> (f: (a: A, b: B) => C): (ab: [A, B]) => C {
  return ([a, b]) => f(a, b)
}

export function snd <A, B> (p: [A, B]): B {
  return p[1]
}
