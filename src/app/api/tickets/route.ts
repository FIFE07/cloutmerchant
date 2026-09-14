import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Create a ticket + its first message (RLS: own rows only). */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const { subject, body } = await req.json().catch(() => ({}));
  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const { data: ticket, error } = await supabase
    .from("tickets")
    .insert({ user_id: user.id, subject: subject.trim().slice(0, 120) })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: "ticket_failed" }, { status: 500 });

  const { error: msgErr } = await supabase
    .from("ticket_messages")
    .insert({ ticket_id: ticket.id, sender_id: user.id, body: body.trim().slice(0, 4000) });
  if (msgErr) return NextResponse.json({ error: "message_failed" }, { status: 500 });

  return NextResponse.json({ ok: true, ticketId: ticket.id });
}
