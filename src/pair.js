// @flow

// Turn a single value into a pair
export function dup <A> (a: A): [A, A] {
  return [a, a]
}

// swap the contents of a pair
export function swap <A, B> ([a, b]: [A, B]): [B, A] {
  return [b, a]
}
