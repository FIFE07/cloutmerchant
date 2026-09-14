"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Regenerate the reseller API key (calls the regenerate_api_key RPC). */
export function RegenerateKeyButton() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function regenerate() {
    if (busy) return;
    if (!confirm("Regenerate your API key? The old key stops working immediately.")) return;
    setBusy(true);
    try {
      const supabase = createClient();
      await supabase.rpc("regenerate_api_key");
      setDone(true);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        onClick={regenerate}
        disabled={busy}
        className="rounded-lg border border-charcoal-700 px-4 py-2 text-sm text-ink-on-dark transition hover:bg-charcoal-800 disabled:opacity-40"
      >
        {busy ? "Regenerating…" : done ? "New key generated ✓" : "Regenerate key"}
      </button>
    </div>
  );
}
