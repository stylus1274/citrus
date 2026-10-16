"use client";

import { useEffect } from "react";

export default function HernandoLandClearingPage() {
  useEffect(() => {
    window.location.replace("/hernando-land-clearing.html");
  }, []);

  return (
    <main className="redirect-screen" aria-live="polite">
      <p>Opening the Hernando County land clearing page...</p>
      <a href="/hernando-land-clearing.html">Open the full-width page</a>
    </main>
  );
}
