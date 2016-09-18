// @flow

const color = (set, reset = 39) => s => `\u001b[${set}m${s}\u001b[${reset}m`
const cyan = color(36)
const green = color(32)
const dim = color(2, 22)

const logStdout = (t, a, b) => {
  process.stdout.cursorTo(0)
  process.stdout.write(formatStep(t, a, b))
}

const logConsole = (t, a, b) =>
  console.log(t, a, b)

const isNodeTTY = typeof process !== 'undefined' && typeof process.stdout !== 'undefined' && process.stdout.isTTY
const log = isNodeTTY ? logStdout : logConsole

export const logSignal = (t: any, a: any, b: any): boolean =>
  !log(t, a, b)

export const formatStep = (t: any, a: any, b: any): string =>
  `${dim(t + ':')} ${cyan(JSON.stringify(a))} ${dim('->')} ${green(JSON.stringify(b))}`
