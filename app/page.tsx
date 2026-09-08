"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    window.location.replace("/design.html");
  }, []);

  return (
    <main className="redirect-screen" aria-live="polite">
      <p>Opening the Citrus Demolition Services design...</p>
      <a href="/design.html">Open the full-width design</a>
    </main>
  );
}
