"use client";

import { useEffect } from "react";

export default function SitePreparationPage() {
  useEffect(() => {
    window.location.replace("/site-preparation.html");
  }, []);

  return (
    <main className="redirect-screen" aria-live="polite">
      <p>Opening the Citrus Site Preparation Services design...</p>
      <a href="/site-preparation.html">Open the full-width design</a>
    </main>
  );
}
