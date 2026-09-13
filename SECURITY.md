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

The public availability endpoint can spend real money against a configured Twilio account. It is
rate-limited in-process (`lib/rate-limit.ts`) and returns `configured: false` (making zero network
calls) when no credentials are set. If you deploy publicly with your own Twilio account, put a
distributed rate limiter / WAF in front of it as well.
