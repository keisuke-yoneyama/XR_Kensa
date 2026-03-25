import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProjectById } from "@/lib/api/projects";
import { GLBViewer } from "@/components/viewer/glb-viewer";
import { getStorageModelUrl } from "@/lib/storage/models";
import { getModelPath, FALLBACK_MODEL_PATH } from "@/lib/model-paths";

type ModelSource = "storage" | "local" | "fallback";

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

  // モデル URL の解決: Storage → ローカルパス → サンプル の順で試みる
  const storageUrl = await getStorageModelUrl(id, client);
  const localPath = getModelPath(id);
  const modelPath = storageUrl ?? localPath ?? FALLBACK_MODEL_PATH;
  const modelSource: ModelSource = storageUrl
    ? "storage"
    : localPath
      ? "local"
      : "fallback";

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

      <ModelSourceBanner source={modelSource} projectId={id} />

      <div className="min-h-0 flex-1" style={{ height: "calc(100vh - 240px)" }}>
        <GLBViewer modelPath={modelPath} />
      </div>
    </section>
  );
}

function ModelSourceBanner({
  source,
  projectId,
}: {
  source: ModelSource;
  projectId: string;
}) {
  if (source === "storage") return null;

  if (source === "local") {
    return (
      <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sm text-sky-800">
        ローカルファイルを表示中です。Supabase Storage に{" "}
        <code className="font-mono">{projectId}.glb</code> をアップロードすると
        Storage 参照に切り替わります。
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
      このプロジェクト専用のモデルファイルが未登録のため、サンプルを表示しています。
      Storage に <code className="font-mono">{projectId}.glb</code>{" "}
      をアップロードするか、{" "}
      <code className="font-mono">src/lib/model-paths.ts</code>{" "}
      にローカルパスを登録してください。
    </div>
  );
}
