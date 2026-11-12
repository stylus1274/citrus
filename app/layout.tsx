import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Citrus Demolition & Land Clearing | Central Florida",
  description:
    "Licensed demolition, land clearing, site preparation, and debris removal services across Central Florida.",
  verification: {
    google: "sEFZ5RvYZ9kVcnRqnwySDrF8jF42n5ZAYSdl4clcPx4",
  },
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
      <head
        dangerouslySetInnerHTML={{
          __html: `<!-- Existing GA4 tag -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-4WQ5Z1CLMZ"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-4WQ5Z1CLMZ');

  // Both Tag Manager containers share the existing data layer.
  (function(w,d,s,l,i){
    w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
    var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
    j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
    f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-WNQ48XWW');
  (function(w,d,s,l,i){
    w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
    var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
    j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
    f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-NKPJGNNC');

  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window,document,'clarity','script','z8s2u64e3i');
</script>`,
        }}
      />
      <body>{children}</body>
    </html>
  );
}
