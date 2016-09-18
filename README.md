# Arrow

Push-pull Signal Function FRP.

## Goals

- Learn about Signal Functions, Signal Vectors, Arrows, and Profunctors
- See if Signal-Function / Arrowized FRP is a viable approach to interactive apps in JavaScript

## Design goals

- Implement sound FRP semantics with a pure foundation (as far as possible in JS)
	- Avoid bugs, race conditions, and glitches
	- Push impurity and IO to the edges
- Balance JavaScript's event-driven nature with the simplicity and predictability of programming with continuous values and total functions
	- Use a push-pull approach instead of either pull-only, or push-only
- Favor composition as a base programming API
    - Provide a core set of operators with rigorous semantics as building blocks
	- Assemble higher level operations by composing existing ones

## References

- [Edward Amsden, __Time Files: Push-Pull Signal-Function Functional Reactive Programming__](https://github.com/eamsden/pushbasedFRP/blob/master/Docs/Thesis/thesis.pdf)
    - [Github repo](https://github.com/eamsden/pushbasedFRP)
- [Netwire](https://hackage.haskell.org/package/netwire)
- [FRP.Reactive](http://hackage.haskell.org/package/reactive-0.11.5)
