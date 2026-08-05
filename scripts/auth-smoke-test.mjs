// Live smoke test: sign up a throwaway user with the anon key and report what
// the server says. The trigger-created profile is verified separately in SQL.
// Run: node scripts/auth-smoke-test.mjs  (env vars required)
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, anon);

const email = `cloutmerchant.smoketest+${Date.now()}@gmail.com`;
const { data, error } = await supabase.auth.signUp({
  email,
  password: "SmokeTest-Password-123!",
  options: { data: { display_name: "Smoke Test" } },
});

if (error) {
  console.error("SIGNUP FAILED:", error.message);
  process.exit(1);
}
console.log("SIGNUP OK — user id:", data.user?.id);
console.log("email confirmation required:", !data.session);
console.log("EMAIL:", email);
