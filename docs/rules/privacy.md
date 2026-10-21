# Nothing is stored

No accounts, no history, no database, no payload logging. The PDF passes through the proxy in
memory to bankstract-cloud (whose own in-memory, metadata-only posture applies upstream) and
the conversion runs in the user's browser. If a feature needs storage, it is out of scope until
the PRD says otherwise. Do not add analytics beyond privacy-safe counters (conversions per
target app, never content).

Secrets handling lives in [secrets.md](./secrets.md).
