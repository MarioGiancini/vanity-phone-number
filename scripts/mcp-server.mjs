#!/usr/bin/env node
/**
 * MCP server for the Vanity Phone Number Studio.
 *
 * Thin stdio wrapper over the authenticated agent API, so any MCP-capable agent
 * (Claude Code, Cursor, etc.) can generate vanity numbers, decode numbers, and
 * check availability.
 *
 * Env:
 *   VANITY_API_URL        Base URL of the running studio (default http://localhost:3000)
 *   VANITY_AGENT_API_KEY  Same key the server was started with
 *
 * Config (Claude Code `.mcp.json`):
 *   {
 *     "mcpServers": {
 *       "vanity": {
 *         "command": "node",
 *         "args": ["scripts/mcp-server.mjs"],
 *         "env": { "VANITY_AGENT_API_KEY": "…" }
 *       }
 *     }
 *   }
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_URL = (process.env.VANITY_API_URL ?? "http://localhost:3000").replace(/\/$/, "");
const API_KEY = process.env.VANITY_AGENT_API_KEY;

async function callApi(path, body) {
  if (!API_KEY) {
    throw new Error(
      "VANITY_AGENT_API_KEY is not set. Add it to the MCP server's env in .mcp.json.",
    );
  }
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  if (!response.ok) throw new Error(`API ${response.status}: ${JSON.stringify(data)}`);
  return data;
}

function text(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function error(message) {
  return { content: [{ type: "text", text: message }], isError: true };
}

async function guard(fn) {
  try {
    return text(await fn());
  } catch (cause) {
    return error(cause instanceof Error ? cause.message : String(cause));
  }
}

const server = new McpServer({ name: "vanity-phone-number", version: "0.1.0" });

server.tool(
  "find_vanity_numbers",
  "Find ranked vanity phone numbers from a brief. Use for requests like \"find me a cool available vanity number in Las Vegas for a tech business\". Set onlyAvailable to filter to numbers Twilio can sell.",
  {
    prompt: z.string().optional().describe("Natural-language brief"),
    areaCode: z.string().optional().describe("3-digit area code (overrides the prompt)"),
    theme: z.string().optional().describe("Word pack id, e.g. tech, trendy, luxury, money"),
    words: z.array(z.string()).optional().describe("Explicit words, e.g. ['BIG','CODE']"),
    limit: z.number().int().min(1).max(100).optional(),
    checkAvailability: z.boolean().optional(),
    onlyAvailable: z.boolean().optional(),
  },
  (args) => guard(() => callApi("/api/agent/find", args)),
);

server.tool(
  "decode_number",
  "Decode a phone number into the words it can spell.",
  {
    number: z.string().describe("7-digit local or 10-digit number"),
    areaCode: z.string().optional(),
  },
  (args) => guard(() => callApi("/api/agent/decode", args)),
);

server.tool(
  "check_availability",
  "Check whether a single number is in Twilio's purchasable inventory.",
  { number: z.string() },
  (args) => guard(() => callApi("/api/availability", args)),
);

const transport = new StdioServerTransport();
await server.connect(transport);
