import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Services in one category, for the New Order form's Service dropdown. */
export async function GET(req: Request) {
  const category = new URL(req.url).searchParams.get("category");
  if (!category || !/^[0-9a-f-]{36}$/i.test(category)) {
    return NextResponse.json({ services: [] });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, provider_service_id, name, description, subcategory, price_per_1000_kobo, min_qty, max_qty, refill")
    .eq("category_id", category)
    .eq("is_active", true)
    .order("price_per_1000_kobo")
    .limit(1200);

  if (error) return NextResponse.json({ services: [] }, { status: 500 });
  return NextResponse.json({ services: data ?? [] });
}
