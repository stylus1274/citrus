"use client";

import { useEffect } from "react";

export default function HernandoPage() {
  useEffect(() => {
    window.location.replace("/hernando.html");
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <p>Opening the Hernando County demolition and land clearing design...</p>
    </main>
  );
}
