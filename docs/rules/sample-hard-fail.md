# Never convert the canned sample

bankstract-cloud answers over-cap requests with a 200 canned SYNTHETIC statement, marked with
`_sample` in the JSON and `X-Bankstract-Sample: true`. If Danfo ever converts that response, a
user imports fake transactions into their real budget. The hard-fail lives in
`src/app/api/parse/route.ts` and must survive every refactor. There is no feature worth
weakening it for.
