import { createBrowserClient } from "@supabase/ssr";

// NEXT_PUBLIC_ prefix makes these available on both server and client.
// Set them in .env.local (see .env.local.example).
// createBrowserClient (not createClient) stores the session in cookies,
// which makes it readable by the SSR middleware for route protection.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
