"use client";

import { useEffect } from "react";

export default function DemolitionServicesPage() {
  useEffect(() => {
    window.location.replace("/demolition-services.html");
  }, []);

  return (
    <main className="redirect-screen" aria-live="polite">
      <p>Opening the Citrus Demolition Services page...</p>
      <a href="/demolition-services.html">Open the full-width page</a>
    </main>
  );
}
