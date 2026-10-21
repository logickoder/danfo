# Secrets never commit

Public repo. `DANFO_API_KEY` and Turnstile secrets live in `.env.local` (gitignored) and the
host's env, never in source. `.env.example` carries placeholders only.
