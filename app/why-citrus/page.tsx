"use client";

import { useEffect } from "react";

export default function WhyCitrusPage() {
  useEffect(() => {
    window.location.replace("/why-citrus.html");
  }, []);

  return (
    <main className="redirect-screen" aria-live="polite">
      <p>Opening the Why Citrus page...</p>
      <a href="/why-citrus.html">Open the full-width design</a>
    </main>
  );
}
