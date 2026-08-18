import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  description: "Private Plancify MVP administration.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
  openGraph: {
    title: "Plancify Admin",
    description: "Private Plancify MVP administration.",
    images: [],
  },
  twitter: {
    title: "Plancify Admin",
    description: "Private Plancify MVP administration.",
    images: [],
  },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
