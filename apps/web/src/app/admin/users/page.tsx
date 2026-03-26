import Link from "next/link";
import { listUsers } from "./actions";

export default async function AdminUsersPage() {
  const result = await listUsers();

  return (
    <section className="space-y-6">
      <Link className="inline-flex text-sm font-medium" href="/projects">
        ← プロジェクト一覧
      </Link>

      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-steel-500">
            Admin
          </p>
          <h1 className="text-3xl font-semibold">ユーザー一覧</h1>
        </div>
        <Link
          className="rounded-lg bg-steel-700 px-4 py-2 text-sm font-medium text-white hover:bg-steel-800"
          href="/admin/users/new"
        >
          + 新規登録
        </Link>
      </div>

      {!result.success ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          ユーザー一覧の取得に失敗しました: {result.error}
        </p>
      ) : result.users.length === 0 ? (
        <p className="text-sm text-slate-500">登録済みユーザーはいません。</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 font-medium text-slate-600">
                  メールアドレス
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">
                  表示名
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">
                  ロール
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">
                  登録日
                </th>
              </tr>
            </thead>
            <tbody>
              {result.users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-100 last:border-none"
                >
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {user.displayName || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {user.role === "admin" ? "管理者" : "一般"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-slate-400">
        ユーザー数: {result.success ? result.users.length : "—"}
      </p>
    </section>
  );
}
