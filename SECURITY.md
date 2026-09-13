# Security Policy

## Reporting a vulnerability

Please email **mario@giancini.com** with a description and reproduction steps. Do not open a public
issue. You'll get an acknowledgement and, where warranted, credit in the fix.

## Handling secrets

This project is safe to self-host and never requires committed secrets:

- `.env.local` (Twilio credentials, `VANITY_AGENT_API_KEY`) is gitignored.
- `.mcp.json` (MCP config, contains the agent key) is gitignored.
- `scripts/mcp-server.mjs` reads its key from the environment only.
- Twilio credentials (API key or auth token) are read server-side in `lib/agent/twilio.ts` and never
  returned to clients. Prefer a scoped API Key over the account Auth Token.

## Abuse protection

The public availability endpoint can spend real money against a configured Twilio account. It is
rate-limited in-process (`lib/rate-limit.ts`) and returns `configured: false` (making zero network
calls) when no credentials are set. If you deploy publicly with your own Twilio account, put a
distributed rate limiter / WAF in front of it as well.
