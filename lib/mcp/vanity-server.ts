import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DICTIONARY } from "@/data/dictionary";
import { BUILT_IN_LISTS } from "@/data/word-lists";
import type { CarrierOverride } from "@/lib/agent/credentials";
import { discoverVanityNumbers } from "@/lib/agent/discover";
import { findCandidates } from "@/lib/agent/find";
import { anyProviderConfigured, checkExact, verifyWords } from "@/lib/agent/providers";
import { buildDigitIndex, decodeLocal, type DigitIndex } from "@/lib/vanity";

let cachedIndex: DigitIndex | undefined;

function getIndex(): DigitIndex {
  if (!cachedIndex) {
    const words = new Set<string>(DICTIONARY);
    for (const list of BUILT_IN_LISTS) {
      for (const word of list.words) words.add(word.toUpperCase());
    }
    cachedIndex = buildDigitIndex(words);
  }
  return cachedIndex;
}

function text(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function error(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

/**
 * The Vanity Phone Number Studio MCP server. Used both by the stdio server and
 * the remote `/api/mcp` endpoint. Tools call the domain/provider layer directly.
 *
 * `override` carries bring-your-own-keys credentials for the current request.
 */
export function createVanityMcpServer(override?: CarrierOverride): McpServer {
  const server = new McpServer({ name: "vanity-phone-number", version: "0.1.0" });

  server.tool(
    "find_vanity_numbers",
    "Find ranked vanity phone numbers from a brief or explicit words. Set onlyAvailable to filter to numbers a carrier can sell.",
    {
      prompt: z.string().optional().describe("Natural-language brief"),
      areaCode: z.string().optional().describe("3-digit area code (overrides the prompt)"),
      theme: z.string().optional().describe("Word pack id, e.g. tech, trendy, luxury, money"),
      words: z.array(z.string()).optional().describe("Explicit words, e.g. ['BIG','CODE']"),
      limit: z.number().int().min(1).max(100).optional(),
      onlyAvailable: z.boolean().optional(),
    },
    async (args) => {
      const { resolved, candidates } = findCandidates(args);
      let results: (typeof candidates[number] & { availability: Awaited<ReturnType<typeof checkExact>> | null })[] =
        candidates.map((candidate) => ({ ...candidate, availability: null }));

      const configured = anyProviderConfigured(override);
      if (args.onlyAvailable && configured) {
        const top = results.slice(0, 5);
        results = [
          ...(await Promise.all(
            top.map(async (candidate) => ({
              ...candidate,
              availability: await checkExact(candidate.dialable, { override }),
            })),
          )),
          ...results.slice(5),
        ];
        results = results.filter((candidate) => candidate.availability?.available === true);
      }

      return text({ resolved, availabilityConfigured: configured, count: results.length, results });
    },
  );

  server.tool(
    "find_available_numbers",
    "Scan an area code's available inventory and return numbers that spell real words. Best when no specific words are given.",
    {
      areaCode: z.string().describe("3-digit area code"),
      pages: z.number().int().min(1).max(3).optional(),
      limit: z.number().int().min(1).max(50).optional(),
    },
    async (args) => text(await discoverVanityNumbers({ ...args, override })),
  );

  server.tool(
    "decode_number",
    "Decode a phone number into the words it can spell.",
    { number: z.string().describe("7-digit local or 10-digit number") },
    async ({ number }) => {
      const digits = number.replace(/[^0-9]/g, "");
      const local = digits.length > 7 ? digits.slice(-7) : digits;
      const areaCode = digits.length >= 10 ? digits.slice(0, 3) : "702";
      if (!/^[0-9]{7}$/.test(local)) {
        return error("Provide a 7-digit local number (e.g. 7764726) or a 10-digit number.");
      }
      const readings = decodeLocal(local, getIndex(), { areaCode, limit: 50 });
      return text({ areaCode, local, count: readings.length, readings });
    },
  );

  server.tool(
    "check_availability",
    "Check whether a single number is in a carrier's purchasable inventory.",
    { number: z.string() },
    async ({ number }) => text(await checkExact(number, { override })),
  );

  server.tool(
    "verify_words",
    "Batch-verify words against Twilio inventory using the Contains pattern (one call per word).",
    {
      areaCode: z.string(),
      words: z.array(z.string()).max(20),
    },
    async ({ areaCode, words }) =>
      text({
        areaCode,
        results: await verifyWords(areaCode, words, { override }),
        availabilityConfigured: anyProviderConfigured(override),
      }),
  );

  return server;
}
