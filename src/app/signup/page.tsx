"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthCard, PasswordInput, friendlyAuthError } from "@/components/AuthUI";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: displayName.trim() },
        // Confirmation links land on a page WE own (spec §5).
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setBusy(false);
    if (error) {
      setError(friendlyAuthError(error.message));
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <AuthCard
        title="Check your inbox ✉️"
        subtitle={`We sent a confirmation link to ${email}. Click it to activate your account — it opens right here on CLOUTMERCHANT. Didn't arrive? Check spam, or try signing up again in a few minutes.`}
        footer={
          <>
            Already confirmed?{" "}
            <Link href="/login" className="font-medium text-teal-pop-600 hover:underline">
              Log in
            </Link>
          </>
        }
      >
        <div />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Free to join. Your wallet starts at ₦0 — top up only when you're ready to order."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-teal-pop-600 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Display name</span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="name"
            required
            maxLength={60}
            placeholder="What should we call you?"
            className="w-full rounded-xl border border-cream-200 bg-surface-raised px-4 py-3 text-ink shadow-sm outline-none placeholder:text-ink-muted/60 focus:border-amber-glow-400"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-xl border border-cream-200 bg-surface-raised px-4 py-3 text-ink shadow-sm outline-none placeholder:text-ink-muted/60 focus:border-amber-glow-400"
          />
        </label>
        <PasswordInput
          label="Password (8+ characters)"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
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
          {busy ? "Creating your account…" : "Create account"}
        </button>
        <p className="text-center text-xs leading-relaxed text-ink-muted">
          By signing up you agree to our{" "}
          <Link href="/terms" className="underline">Terms</Link>,{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link> and{" "}
          <Link href="/refunds" className="underline">Refund Policy</Link>.
        </p>
      </form>
    </AuthCard>
  );
}
