"use client";

import { useEffect } from "react";

export default function EmergencyDemolitionPage() {
  useEffect(() => {
    window.location.replace("/emergency-demolition.html");
  }, []);

  return (
    <main className="redirect-screen" aria-live="polite">
      <p>Opening the Emergency &amp; Storm-Damage Demolition page...</p>
      <a href="/emergency-demolition.html">Open the full-width design</a>
    </main>
  );
}
