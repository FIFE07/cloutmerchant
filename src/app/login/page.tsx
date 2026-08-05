"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthCard, PasswordInput, friendlyAuthError } from "@/components/AuthUI";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/app";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setBusy(false);
      setError(friendlyAuthError(error.message));
      return;
    }
    router.push(next.startsWith("/") ? next : "/app");
    router.refresh();
  }

  return (
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
      <PasswordInput
        label="Password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        minLength={1}
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
        {busy ? "Logging you in…" : "Log in"}
      </button>
      <p className="text-center text-sm">
        <Link href="/forgot-password" className="font-medium text-teal-pop-600 hover:underline">
          Forgot your password?
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to fund your wallet, place orders and track delivery."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-medium text-teal-pop-600 hover:underline">
            Create a free account
          </Link>
        </>
      }
    >
      <Suspense fallback={<p className="text-sm text-ink-muted">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
