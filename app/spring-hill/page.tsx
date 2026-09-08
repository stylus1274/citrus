"use client";

import { useEffect } from "react";

export default function SpringHillPage() {
  useEffect(() => {
    window.location.replace("/spring-hill.html");
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <p>Opening the Spring Hill demolition and land clearing design...</p>
    </main>
  );
}
