"use client";

import { useEffect } from "react";

export default function CommercialDemolitionPage() {
  useEffect(() => {
    window.location.replace("/commercial-demolition.html");
  }, []);

  return (
    <main className="redirect-screen" aria-live="polite">
      <p>Opening the Citrus Commercial Demolition Services design...</p>
      <a href="/commercial-demolition.html">Open the full-width design</a>
    </main>
  );
}
