"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/** ユーザー一覧で表示する項目 */
export type UserSummary = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
};

export type ListUsersResult =
  | { success: true; users: UserSummary[] }
  | { success: false; error: string };

/**
 * 登録済みユーザー一覧を取得する Server Action。
 * service_role キーを使うためサーバー側でのみ実行される。
 */
export async function listUsers(): Promise<ListUsersResult> {
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.auth.admin.listUsers();

    if (error) {
      return { success: false, error: error.message };
    }

    const users: UserSummary[] = (data.users ?? []).map((u) => ({
      id: u.id,
      email: u.email ?? "",
      displayName: (u.user_metadata?.display_name as string) ?? "",
      role: (u.app_metadata?.role as string) ?? "member",
      createdAt: u.created_at,
    }));

    // 作成日時の降順（新しいユーザーが上）
    users.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return { success: true, users };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "予期しないエラーが発生しました。";
    return { success: false, error: message };
  }
}
