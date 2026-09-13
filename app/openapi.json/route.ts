import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

/** OpenAPI 3.1 description of the agent API. */
export function GET() {
  const base = siteUrl();
  const document = {
    openapi: "3.1.0",
    info: {
      title: "Vanity Phone Number Studio — Agent API",
      version: "0.1.0",
      description:
        "Generate memorable vanity phone numbers from a brief, decode numbers into words, and verify availability.",
      license: { name: "MIT", url: "https://github.com/MarioGiancini/vanity-phone-number/blob/main/LICENSE" },
    },
    servers: [{ url: base }],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "VANITY_AGENT_API_KEY. Sent as `Authorization: Bearer <key>` or `x-api-key`.",
        },
      },
      schemas: {
        Candidate: {
          type: "object",
          properties: {
            areaCode: { type: "string" },
            local: { type: "string", description: "Local letters/digits, e.g. BIGCODE" },
            words: { type: "array", items: { type: "string" } },
            vanity: { type: "string", example: "702-BIG-CODE" },
            numeric: { type: "string", example: "702-244-2633" },
            dialable: { type: "string", example: "7022442633" },
            coverage: { type: "number" },
            score: { type: "number", description: "Memorability score 0-100" },
            availability: { type: ["object", "null"] },
          },
        },
      },
    },
    paths: {
      "/api/agent": {
        get: {
          summary: "Capability document",
          security: [],
          responses: { "200": { description: "Endpoints, themes, and examples" } },
        },
      },
      "/api/agent/find": {
        post: {
          summary: "Find ranked vanity numbers",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    prompt: { type: "string", example: "cool vanity number in Las Vegas for a tech business that is available" },
                    areaCode: { type: "string" },
                    theme: { type: "string" },
                    words: { type: "array", items: { type: "string" } },
                    limit: { type: "integer" },
                    checkAvailability: { type: "boolean" },
                    onlyAvailable: { type: "boolean" },
                    availabilityLimit: { type: "integer" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Ranked candidates",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      resolved: { type: "object" },
                      availabilityConfigured: { type: "boolean" },
                      count: { type: "integer" },
                      notes: { type: "array", items: { type: "string" } },
                      results: { type: "array", items: { $ref: "#/components/schemas/Candidate" } },
                    },
                  },
                },
              },
            },
            "401": { description: "Missing or invalid agent key" },
            "503": { description: "Agent API not configured on the server" },
          },
        },
      },
      "/api/agent/decode": {
        post: {
          summary: "Decode a number into dictionary readings",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    number: { type: "string", example: "702-776-4726" },
                    minPart: { type: "integer" },
                    maxParts: { type: "integer" },
                    limit: { type: "integer" },
                  },
                  required: ["number"],
                },
              },
            },
          },
          responses: { "200": { description: "Readings" }, "401": { description: "Unauthorized" } },
        },
      },
      "/api/agent/verify": {
        post: {
          summary: "Batch-verify words against Twilio inventory",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    areaCode: { type: "string", example: "702" },
                    words: {
                      type: "array",
                      items: { type: "string" },
                      maxItems: 20,
                      example: ["BIGCODE", "PROGRAM"],
                    },
                  },
                  required: ["areaCode", "words"],
                },
              },
            },
          },
          responses: { "200": { description: "Per-word availability" }, "401": { description: "Unauthorized" } },
        },
      },
      "/api/availability": {
        post: {
          summary: "Check a single number against Twilio inventory",
          responses: { "200": { description: "Availability result" }, "429": { description: "Rate limited" } },
        },
      },
    },
  };

  return Response.json(document, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
