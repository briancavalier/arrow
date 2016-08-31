# Arrow

Experimenting with arrowized push-pull FRP.

## Design goals

- Implement sound FRP semantics with a pure foundation (as far as possible in JS)
	- Avoid bugs, race conditions, and glitches
	- Push impurity and IO to the edges
- Balance JavaScript's event-driven nature with the simplicity and predictability of programming with continuous values and total functions
	- Use a push-pull approach instead of either pull-only, or push-only
- Favor composition as a base programming API
    - Provide a core set of operators with rigorous semantics as building blocks
	- Assemble higher level operations by composing existing ones

