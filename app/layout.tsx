import type { Metadata } from "next";
import { headers } from "next/headers";
import { AuthProvider } from "@/app/components/auth-provider";
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
      default: "Planify — Discover. Try. Reflect. Plan.",
      template: "%s · Planify",
    },
    description:
      "Career exploration for Indian students: discover promising directions, try real activities, and build a flexible 90-day roadmap.",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      type: "website",
      url: origin,
      siteName: "Planify",
      title: "Planify — Your future isn’t a test result.",
      description:
        "Discover promising directions, try real career activities, and build a living roadmap before making a high-stakes choice.",
      images: [
        {
          url: `${origin}/og.png`,
          width: 1731,
          height: 909,
          alt: "Planify — Your future isn’t a test result.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Planify — Your future isn’t a test result.",
      description:
        "Discover, try, reflect, and build a career roadmap grounded in real evidence.",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('planify-theme')==='dark'?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){document.documentElement.dataset.theme='light'}",
          }}
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
