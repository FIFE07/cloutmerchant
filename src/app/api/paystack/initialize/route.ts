import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Start a Paystack payment. Returns the authorization_url to redirect to.
 * Paystack sends the real confirmation to /api/paystack/webhook (server-signed).
 */
export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "payments_not_configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const { amountNaira } = await req.json().catch(() => ({}));
  const amount = Math.round(Number(amountNaira) * 100); // kobo
  if (!Number.isFinite(amount) || amount < 10000 || amount > 10_000_000_00) {
    return NextResponse.json({ error: "amount_invalid" }, { status: 400 });
  }

  const reference = `cm_${user.id.slice(0, 8)}_${Date.now()}`;
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user.email,
      amount,
      reference,
      currency: "NGN",
      metadata: { user_id: user.id },
    }),
  });
  const data = await res.json();
  if (!data.status) {
    return NextResponse.json({ error: "paystack_init_failed" }, { status: 502 });
  }
  return NextResponse.json({ url: data.data.authorization_url, reference });
}
