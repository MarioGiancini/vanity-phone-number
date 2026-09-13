export interface TwilioOverride {
  accountSid: string;
  apiKey: string;
  apiSecret: string;
}

export interface TelnyxOverride {
  apiKey: string;
}

export interface CarrierOverride {
  twilio?: TwilioOverride;
  telnyx?: TelnyxOverride;
}

/**
 * Read bring-your-own-keys credentials from request headers. Callers send them
 * per request; the server uses them transiently and never stores them.
 *
 * Headers:
 *   x-carrier-twilio-account-sid
 *   x-carrier-twilio-api-key
 *   x-carrier-twilio-api-secret
 *   x-carrier-telnyx-api-key
 */
export function carrierOverride(request: Request): CarrierOverride | undefined {
  const header = (name: string): string | undefined => request.headers.get(name)?.trim() || undefined;

  const override: CarrierOverride = {};

  const accountSid = header("x-carrier-twilio-account-sid");
  const apiKey = header("x-carrier-twilio-api-key");
  const apiSecret = header("x-carrier-twilio-api-secret");
  if (accountSid && apiKey && apiSecret) {
    override.twilio = { accountSid, apiKey, apiSecret };
  }

  const telnyxApiKey = header("x-carrier-telnyx-api-key");
  if (telnyxApiKey) override.telnyx = { apiKey: telnyxApiKey };

  return Object.keys(override).length > 0 ? override : undefined;
}
