import { createClient } from "@supabase/supabase-js";

// NEXT_PUBLIC_ prefix makes these available on both server and client.
// Set them in .env.local (see .env.local.example).
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
