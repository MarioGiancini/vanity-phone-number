import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Content negotiation for agents: advertise that `/` varies by Accept.
        source: "/",
        headers: [{ key: "Vary", value: "Accept" }],
      },
      {
        source: "/docs",
        headers: [{ key: "Vary", value: "Accept" }],
      },
    ];
  },
};

export default nextConfig;
