"use client";

import { useEffect } from "react";

export default function InvernessPage() {
  useEffect(() => {
    window.location.replace("/inverness.html");
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <p>Opening the Inverness demolition and land clearing design...</p>
    </main>
  );
}
