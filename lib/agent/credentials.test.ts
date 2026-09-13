import { describe, expect, it } from "vitest";
import { carrierOverride } from "./credentials";
import { twilioCredentials } from "./twilio";

describe("carrierOverride", () => {
  it("parses per-request carrier headers", () => {
    const request = new Request("http://localhost/api/availability", {
      headers: {
        "x-carrier-twilio-account-sid": "AC1",
        "x-carrier-twilio-api-key": "SK1",
        "x-carrier-twilio-api-secret": "secret1",
        "x-carrier-telnyx-api-key": "KEY1",
      },
    });
    expect(carrierOverride(request)).toEqual({
      twilio: { accountSid: "AC1", apiKey: "SK1", apiSecret: "secret1" },
      telnyx: { apiKey: "KEY1" },
    });
  });

  it("returns undefined without headers", () => {
    expect(carrierOverride(new Request("http://localhost"))).toBeUndefined();
  });

  it("ignores partial Twilio credentials", () => {
    const request = new Request("http://localhost", {
      headers: { "x-carrier-twilio-account-sid": "AC1" },
    });
    expect(carrierOverride(request)).toBeUndefined();
  });
});

describe("twilioCredentials with an override", () => {
  it("prefers the override over env", () => {
    expect(
      twilioCredentials({ accountSid: "ACX", apiKey: "SKX", apiSecret: "secretX" }),
    ).toEqual({ accountSid: "ACX", username: "SKX", password: "secretX" });
  });
});
