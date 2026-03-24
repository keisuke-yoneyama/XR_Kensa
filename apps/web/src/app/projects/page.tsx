import Link from "next/link";
import { getProjects } from "@/lib/api/projects";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-steel-700">Projects</p>
          <h1 className="text-3xl font-semibold">工事一覧</h1>
          <p className="text-sm text-slate-600">Supabase の projects テーブルから取得しています。</p>
        </div>
        <Link
          href="/projects/new"
          className="shrink-0 rounded-lg bg-steel-700 px-4 py-2 text-sm font-medium text-white no-underline"
        >
          新規工事登録
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          工事がまだ登録されていません。「新規工事登録」から追加してください。
        </p>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              className="block rounded-xl border border-slate-200 bg-white p-5 no-underline shadow-sm transition hover:border-steel-300"
              href={`/projects/${project.id}`}
            >
              <p className="text-sm font-medium text-steel-700">{project.code}</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">{project.name}</h2>
              <p className="mt-3 text-sm text-slate-600">ステータス: {project.status}</p>
              <p className="text-sm text-slate-600">バージョン: {project.version}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
