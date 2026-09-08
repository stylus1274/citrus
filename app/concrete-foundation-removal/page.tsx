"use client";

import { useEffect } from "react";

export default function ConcreteFoundationRemovalPage() {
  useEffect(() => {
    window.location.replace("/concrete-foundation-removal.html");
  }, []);

  return (
    <main className="redirect-screen" aria-live="polite">
      <p>Opening the Concrete, Foundation &amp; Slab Removal page...</p>
      <a href="/concrete-foundation-removal.html">Open the full-width design</a>
    </main>
  );
}
