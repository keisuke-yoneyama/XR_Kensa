import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProjectById } from "@/lib/api/projects";
import { getProjectModels } from "@/lib/storage/models";
import { ModelUploadForm } from "./upload-form";
import { ModelList } from "./model-list";

export default async function ProjectModelsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await createSupabaseServerClient();
  const [project, models] = await Promise.all([
    getProjectById(id, client),
    getProjectModels(id, client),
  ]);

  if (!project) {
    return (
      <section className="space-y-4">
        <Link className="inline-flex text-sm font-medium" href="/projects">
          ← 工事一覧
        </Link>
        <p className="text-slate-600">プロジェクトが見つかりません（ID: {id}）</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Link
        className="inline-flex text-sm font-medium text-slate-500 hover:text-slate-800"
        href={`/projects/${id}`}
      >
        ← {project.name}
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">3D モデル管理</h1>
        <p className="text-sm text-slate-500">{project.code}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* アップロードフォーム */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">モデルをアップロード</h2>
          <ModelUploadForm projectId={id} />
        </div>

        {/* 登録済みモデル一覧 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            登録済みモデル（{models.length}件）
          </h2>
          <ModelList models={models} projectId={id} />
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          className="rounded-lg border border-steel-500 bg-steel-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-steel-700"
          href={`/projects/${id}/viewer`}
        >
          3D モデルを見る
        </Link>
      </div>
    </section>
  );
}
