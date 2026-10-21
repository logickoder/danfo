# Security Policy

## Scope

Danfo is a thin client: it holds no user accounts, stores no statements, and keeps no
database. The attack surface is the web app itself and its proxy route. Statement parsing
happens upstream in [bankstract-cloud](https://github.com/logickoder/bankstract-cloud); issues
in the parse pipeline belong in that repo's security process, and engine issues in
[bankstract](https://github.com/logickoder/bankstract)'s.

Things we consider vulnerabilities here:

- Any path that writes or logs statement content (the design stores nothing, so any storage
  is a bug)
- Leaking the server-side API key to the client
- Bypassing the `_sample` hard-fail so canned synthetic data could be converted as if real
- The usual web classes: XSS, CSRF on the proxy, dependency CVEs

## Reporting

Report privately via GitHub Security Advisories on this repo, or to the maintainer
([@logickoder](https://github.com/logickoder)). Please do not open a public issue for a
vulnerability. You will get an acknowledgment within a few days; fixes ship as fast as a
one-person project honestly can, and reporters are credited unless they prefer not to be.
