import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { owlet } from "@/lib/providers/panelv2";

/**
 * Place an order:
 * 1. charge the customer's wallet atomically (place_order RPC, RLS-safe)
 * 2. forward the order to Owlet automatically
 * 3. store the provider order id — or refund instantly if the provider fails
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  let body: { serviceId?: string; link?: string; quantity?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { serviceId, link } = body;
  const quantity = Number(body.quantity);
  if (!serviceId || !link || !/^https?:\/\//i.test(link) || !Number.isInteger(quantity) || quantity <= 0) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const { data: order, error } = await supabase.rpc("place_order", {
    p_service_id: serviceId,
    p_link: link,
    p_quantity: quantity,
  });
  if (error) {
    const msg = error.message.includes("insufficient") ? "insufficient_funds" : "order_failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Forward to Owlet.
  const { data: svc } = await supabase
    .from("services")
    .select("provider, provider_service_id")
    .eq("id", serviceId)
    .single();

  if (svc?.provider === "owlet" && svc.provider_service_id) {
    const admin = createAdminClient();
    try {
      const r = await owlet().addOrder(Number(svc.provider_service_id), link, quantity);
      await admin
        .from("orders")
        .update({ provider_order_id: String(r.order), status: "processing" })
        .eq("id", order.id);
    } catch {
      // Provider rejected/failed — refund the wallet immediately.
      // (refund_order RPC needs an admin JWT; service role does a manual refund.)
      await admin
        .from("orders")
        .update({ status: "refunded" })
        .eq("id", order.id);
      await admin.rpc("credit_wallet", {
        p_user_id: user.id,
        p_amount_kobo: order.charge_kobo,
        p_reference: `refund:${order.id}`,
        p_source: "refund",
        p_meta: { reason: "provider_failed" },
      });
      return NextResponse.json({ error: "provider_failed" }, { status: 502 });
    }
  }

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    shortId: String(order.id).slice(0, 8),
    chargeKobo: order.charge_kobo,
  });
}
