"use client";

import { useEffect } from "react";

export default function LandClearingPage() {
  useEffect(() => {
    window.location.replace("/land-clearing.html");
  }, []);

  return (
    <main className="redirect-screen" aria-live="polite">
      <p>Opening the Citrus Land Clearing Services design...</p>
      <a href="/land-clearing.html">Open the full-width design</a>
    </main>
  );
}
