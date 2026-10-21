# Code style

## Strict types green or bust

`strict: true` + `noUncheckedIndexedAccess`. Zero `any` (use `unknown` and narrow). Zero
`@ts-ignore` (use `@ts-expect-error` with a reason).

## No boilerplate comments

Comments earn their place when removing them would confuse a future reader. The sample-marker
comment in the proxy is the model: it explains a non-obvious danger, not what the code says.
