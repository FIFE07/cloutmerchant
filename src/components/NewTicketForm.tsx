"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Create a support ticket (subject + first message). */
export function NewTicketForm() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !body.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), body: body.trim() }),
      });
      if (!res.ok) throw new Error();
      setSubject("");
      setBody("");
      router.refresh();
    } catch {
      setError("Could not create the ticket. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-lg border border-charcoal-700 bg-charcoal-800 px-3 py-2.5 text-sm text-ink-on-dark placeholder:text-ink-on-dark-muted/60 focus:border-amber-glow-400 focus:outline-none";

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        className={input}
        placeholder="Subject — e.g. Order stuck in pending"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        maxLength={120}
        required
      />
      <textarea
        className={`${input} min-h-28 resize-y`}
        placeholder="Describe the problem. If it's about an order, paste the order ID."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
      />
      {error && <p className="rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={busy || !subject.trim() || !body.trim()}
        className="w-full rounded-lg bg-amber-glow-400 py-3 font-display text-sm font-bold text-charcoal-950 transition hover:bg-amber-glow-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Sending…" : "Open ticket"}
      </button>
    </form>
  );
}
