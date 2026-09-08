"use client";

import { useEffect } from "react";

export default function SelectiveDemolitionPage() {
  useEffect(() => {
    window.location.replace("/selective-demolition.html");
  }, []);

  return (
    <main className="redirect-screen" aria-live="polite">
      <p>Opening the Selective Demolition page...</p>
      <a href="/selective-demolition.html">Open the full-width design</a>
    </main>
  );
}
