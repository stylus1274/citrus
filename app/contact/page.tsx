"use client";

import { useEffect } from "react";

export default function ContactPage() {
  useEffect(() => {
    window.location.replace("/contact.html");
  }, []);

  return (
    <main className="redirect-screen" aria-live="polite">
      <p>Opening the Contact and Free Estimate page...</p>
      <a href="/contact.html">Open the full-width design</a>
    </main>
  );
}
