import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, it } from "vitest";
import { createVanityMcpServer } from "./vanity-server";

async function connect() {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createVanityMcpServer();
  const client = new Client({ name: "test", version: "1.0.0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

describe("vanity MCP server", () => {
  it("exposes the vanity tools", async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    const names = tools.map((tool) => tool.name);
    expect(names).toContain("find_vanity_numbers");
    expect(names).toContain("find_available_numbers");
    expect(names).toContain("decode_number");
    expect(names).toContain("check_availability");
  });

  it("decodes a number via a tool call", async () => {
    const client = await connect();
    const result = await client.callTool({
      name: "decode_number",
      arguments: { number: "7764726" },
    });
    const content = result.content as { type: string; text: string }[];
    expect(content[0].text).toContain("702-PROGRAM");
  });
});
