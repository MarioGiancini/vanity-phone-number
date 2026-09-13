# Security Policy

## Reporting a vulnerability

Please email **mario@giancini.com** with a description and reproduction steps. Do not open a public
issue. You'll get an acknowledgement and, where warranted, credit in the fix.

## Handling secrets

This project is safe to self-host and never requires committed secrets:

- `.env.local` (Twilio/Telnyx credentials, `VANITY_AGENT_API_KEY`) is gitignored.
- `.mcp.json` (MCP config, contains the agent key) is gitignored.
- `scripts/mcp-server.mjs` reads its key from the environment only.
- Carrier credentials (Twilio API key/auth token, Telnyx API key) are read server-side in
  `lib/agent/twilio.ts` / `lib/agent/telnyx.ts` and never returned to clients. Prefer scoped API
  keys over the account Auth Token.

## Abuse protection

The public availability and discover endpoints can spend real money against a configured carrier
account. They are rate-limited in-process (`lib/rate-limit.ts`) — aggressively when using the
server's own keys (10 and 2 requests/min per IP), with more headroom when the caller supplies their
own keys (60 and 6/min). They return `configured: false` (making zero network calls) when no
credentials are available. If you deploy publicly with your own carrier account, put a distributed
rate limiter / WAF in front of them as well.

## Bring-your-own-keys

The Carrier keys dialog stores a visitor's own Twilio/Telnyx credentials in their browser
(localStorage) and sends them to this app's own routes per request via `x-carrier-*` headers. The
server uses them only for that request and never persists or logs them. Prefer scoped, rotatable
keys; note that browser storage is readable by any script on the page (XSS), so treat pasted keys as
low-privilege.
