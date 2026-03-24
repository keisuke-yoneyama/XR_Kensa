"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type CreateUserResult =
  | { success: true; email: string }
  | { success: false; error: string };

/**
 * 管理者が新しいユーザーを作成する Server Action。
 * service_role キーを使うためサーバー側でのみ実行される。
 */
export async function createUser(
  email: string,
  password: string,
  displayName: string,
): Promise<CreateUserResult> {
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      user_metadata: displayName ? { display_name: displayName } : undefined,
      email_confirm: true, // 管理者作成のため確認メールをスキップ
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, email: data.user.email ?? email };
  } catch (e) {
    const message = e instanceof Error ? e.message : "予期しないエラーが発生しました。";
    return { success: false, error: message };
  }
}
