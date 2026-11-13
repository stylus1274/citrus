"use client";

import { useState, type FormEvent } from "react";
import styles from "./traffic.module.css";

export function LoginForm() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/traffic/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });
      const result = await response.json();
      setMessage(result.message || "Please try again.");
    } catch {
      setMessage("We could not send the link. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.loginForm} onSubmit={submit}>
      <label htmlFor="traffic-email">Your email</label>
      <input id="traffic-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      <button type="submit" disabled={busy}>{busy ? "Sending link..." : "Email me a sign-in link"}</button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}

export function LogoutButton() {
  async function logout() {
    await fetch("/api/traffic/logout", { method: "POST" });
    window.location.href = "/traffic/";
  }
  return <button className={styles.logout} type="button" onClick={logout}>Sign out</button>;
}
