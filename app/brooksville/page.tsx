"use client";

import { useEffect } from "react";

export default function BrooksvillePage() {
  useEffect(() => {
    window.location.replace("/brooksville.html");
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <p>Opening the Brooksville demolition and land clearing design...</p>
    </main>
  );
}
