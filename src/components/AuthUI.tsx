"use client";

import { useState } from "react";

/**
 * Shared password field with show/hide eye toggle (spec §5).
 * font-size is forced to 16px globally so iOS never zooms and
 * the keyboard never covers the field label.
 */
export function PasswordInput({
  label,
  value,
  onChange,
  autoComplete,
  minLength = 8,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  minLength?: number;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <span className="relative block">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          minLength={minLength}
          required
          className="w-full rounded-xl border border-cream-200 bg-surface-raised px-4 py-3 pr-12 text-ink shadow-sm outline-none focus:border-amber-glow-400"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center text-ink-muted transition hover:text-ink"
        >
          {show ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12A3 3 0 1 1 9.88 9.88" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </span>
    </label>
  );
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-[var(--radius-card)] border border-cream-200 bg-surface-raised p-7 shadow-sm sm:p-9">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{subtitle}</p>
        <div className="mt-7">{children}</div>
      </div>
      <p className="mt-5 text-center text-sm text-ink-muted">{footer}</p>
    </div>
  );
}

/** Warm, human error messages — raw API errors never reach users (spec §9.6). */
export function friendlyAuthError(message: string | undefined): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials"))
    return "That email or password doesn't look right. Try again — or reset your password below.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email first — we sent you a link when you signed up. Check spam too.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "That email already has an account. Try logging in instead.";
  if (m.includes("password"))
    return "Passwords need at least 8 characters. A short phrase works great.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts just now. Give it a minute and try again.";
  return "Something hiccuped on our side. Please try again in a moment.";
}
