import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Paystack webhook — the ONLY path that credits wallets.
 * Verifies the x-paystack-signature, then credits idempotently by reference.
 */
export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ ok: false }, { status: 503 });

  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const expected = createHmac("sha512", secret).update(raw).digest("hex");
  if (signature !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const event = JSON.parse(raw);
  if (event.event !== "charge.success") return NextResponse.json({ ok: true });

  const { reference, amount, metadata } = event.data ?? {};
  const userId = metadata?.user_id;
  if (!reference || !userId || !amount) return NextResponse.json({ ok: true });

  const admin = createAdminClient();
  await admin.rpc("credit_wallet", {
    p_user_id: userId,
    p_amount_kobo: amount,
    p_reference: reference, // unique constraint = idempotent retries
    p_source: "paystack",
    p_meta: { channel: event.data.channel },
  });

  return NextResponse.json({ ok: true });
}
