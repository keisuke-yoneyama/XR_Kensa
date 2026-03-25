import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProjectById } from "@/lib/api/projects";
import { GLBViewer } from "@/components/viewer/glb-viewer";
import { getModelPath, FALLBACK_MODEL_PATH } from "@/lib/model-paths";

export default async function ProjectViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await createSupabaseServerClient();
  const project = await getProjectById(id, client);

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

  const modelPath = getModelPath(id) ?? FALLBACK_MODEL_PATH;
  const isUsingFallback = getModelPath(id) === null;

  return (
    <section className="flex h-full flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link
            className="inline-flex text-sm font-medium text-slate-500 hover:text-slate-800"
            href={`/projects/${id}`}
          >
            ← {project.name}
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">3D モデル</h1>
        </div>
        <p className="text-sm text-slate-500">{project.code}</p>
      </div>

      {isUsingFallback && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          このプロジェクト専用のモデルファイルが未登録のため、サンプルを表示しています。
          登録方法は <code className="font-mono">src/lib/model-paths.ts</code> を参照してください。
        </div>
      )}

      <div className="min-h-0 flex-1" style={{ height: "calc(100vh - 240px)" }}>
        <GLBViewer modelPath={modelPath} />
      </div>
    </section>
  );
}
