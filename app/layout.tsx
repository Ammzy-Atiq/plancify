import type { Metadata } from "next";
import { headers } from "next/headers";
import { AuthProvider } from "@/app/components/auth-provider";
import { DemoProvider } from "@/app/components/demo-provider";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: {
      default: "Plancify - Better decisions start with better exploration.",
      template: "%s · Plancify",
    },
    description:
      "An interactive career-planning and skill-building demo for Indian school students in Classes 6-12.",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      type: "website",
      url: origin,
      siteName: "Plancify",
      title: "Plancify - Start exploring your future now.",
      description:
        "Discover your interests, choose a goal, build skills, and collect proof of progress.",
      images: [
        {
          url: `${origin}/og.png`,
          width: 1731,
          height: 909,
          alt: "Plancify career exploration platform",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Plancify - Better decisions start with better exploration.",
      description:
        "An interactive career-planning and skill-building demo for Classes 6-12.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AuthProvider>
          <DemoProvider>{children}</DemoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
