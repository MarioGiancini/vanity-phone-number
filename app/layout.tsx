import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Vanity Phone Number Studio",
    template: "%s — Vanity Phone Number Studio",
  },
  applicationName: "Vanity Phone Number Studio",
  description:
    "Spell, test, and generate memorable vanity phone numbers from words, combos, and dev terms. Open source and agent-native (REST + MCP).",
  keywords: [
    "vanity phone number",
    "phone word",
    "vanity number generator",
    "MCP server",
    "AI agents",
    "Twilio",
    "Telnyx",
  ],
  authors: [{ name: "Mario Giancini", url: "https://github.com/MarioGiancini" }],
  creator: "Mario Giancini",
  openGraph: {
    type: "website",
    siteName: "Vanity Phone Number Studio",
    title: "Vanity Phone Number Studio",
    description:
      "Spell, test, and generate memorable vanity phone numbers. Open source and agent-native (REST + MCP).",
  },
  twitter: {
    card: "summary",
    title: "Vanity Phone Number Studio",
    description:
      "Spell, test, and generate memorable vanity phone numbers. Open source and agent-native (REST + MCP).",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
