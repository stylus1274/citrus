"use client";

import { useEffect } from "react";

export default function ResidentialDemolitionPage() {
  useEffect(() => {
    window.location.replace("/residential-demolition.html");
  }, []);

  return (
    <main className="redirect-screen" aria-live="polite">
      <p>Opening the Citrus Residential Demolition Services design...</p>
      <a href="/residential-demolition.html">Open the full-width design</a>
    </main>
  );
}
