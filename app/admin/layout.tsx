import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  description: "Private Planify early-access administration.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
  openGraph: {
    title: "Planify Admin",
    description: "Private Planify early-access administration.",
    images: [],
  },
  twitter: {
    title: "Planify Admin",
    description: "Private Planify early-access administration.",
    images: [],
  },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
