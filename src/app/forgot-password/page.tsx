"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthCard, friendlyAuthError } from "@/components/AuthUI";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/app/settings`,
    });
    setBusy(false);
    if (error) {
      setError(friendlyAuthError(error.message));
      return;
    }
    // Always show the same message whether or not the email exists (no account enumeration).
    setDone(true);
  }

  if (done) {
    return (
      <AuthCard
        title="Check your inbox ✉️"
        subtitle={`If an account exists for ${email}, a reset link is on its way. It opens right here on CLOUTMERCHANT so you can choose a new password.`}
        footer={
          <Link href="/login" className="font-medium text-teal-pop-600 hover:underline">
            Back to log in
          </Link>
        }
      >
        <div />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Tell us your account email and we'll send you a reset link."
      footer={
        <Link href="/login" className="font-medium text-teal-pop-600 hover:underline">
          Back to log in
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="w-full rounded-xl border border-cream-200 bg-surface-raised px-4 py-3 text-ink shadow-sm outline-none focus:border-amber-glow-400"
          />
        </label>
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-amber-glow-400 py-3.5 font-display text-base font-semibold text-charcoal-900 transition hover:bg-amber-glow-300 disabled:opacity-60"
        >
          {busy ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthCard>
  );
}
