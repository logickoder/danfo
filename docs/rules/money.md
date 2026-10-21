# Money is a string

Amounts cross the wire as decimal strings (`DecimalString` in `src/lib/types.ts`). Never
`Number()`, `parseFloat()` or `toFixed()` a money value. Writers pass amounts through verbatim
or manipulate them as strings only. The YNAB writer uses the 6-column Outflow/Inflow shape
precisely so no sign math ever touches a money string. Keep it that way.

UI follows the same law: a displayed amount is the DecimalString as it arrived, any sign is a
string prefix, and it renders in JetBrains Mono (`font-mono`).
