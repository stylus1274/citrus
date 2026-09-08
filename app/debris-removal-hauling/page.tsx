"use client";

import { useEffect } from "react";

export default function DebrisRemovalHaulingPage() {
  useEffect(() => {
    window.location.replace("/debris-removal-hauling.html");
  }, []);

  return (
    <main className="redirect-screen" aria-live="polite">
      <p>Opening the Debris Removal &amp; Hauling page...</p>
      <a href="/debris-removal-hauling.html">Open the full-width design</a>
    </main>
  );
}
