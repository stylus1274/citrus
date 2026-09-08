"use client";

import { useEffect } from "react";

export default function MobileHomeDemolitionPage() {
  useEffect(() => {
    window.location.replace("/mobile-home-demolition.html");
  }, []);

  return (
    <main className="redirect-screen" aria-live="polite">
      <p>Opening the Mobile Home Demolition page...</p>
      <a href="/mobile-home-demolition.html">Open the full-width design</a>
    </main>
  );
}
