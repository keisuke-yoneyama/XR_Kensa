import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * サーバーコンポーネント・サーバーアクション向けの Supabase クライアント。
 * Cookie からセッションを読み取るため、RLS の authenticated ポリシーが適用される。
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components から呼ばれる場合は set 不可のため握り潰す
          }
        },
      },
    },
  );
}
