import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Citrus Demolition & Land Clearing | Central Florida",
  description:
    "Licensed demolition, land clearing, site preparation, and debris removal services across Central Florida.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head dangerouslySetInnerHTML={{ __html: "<!-- Google tag (gtag.js) -->\n<script async src=\"https://www.googletagmanager.com/gtag/js?id=G-4WQ5Z1CLMZ\"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n\n  gtag('config', 'G-4WQ5Z1CLMZ');\n</script>" }} />
      <body>{children}</body>
    </html>
  );
}
