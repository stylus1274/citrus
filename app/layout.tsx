import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Citrus Demolition & Land Clearing | Central Florida",
  description:
    "Licensed demolition, land clearing, site preparation, and debris removal services across Central Florida.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
