import Link from "next/link";
import { GLBViewer } from "@/components/viewer/glb-viewer";

const SAMPLE_MODEL_PATH = "/models/sample.glb";

export default function ViewerPage() {
  return (
    <section className="flex h-full flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-steel-700">3D モデルビューア</p>
          <h1 className="text-2xl font-semibold">サンプル GLB 表示</h1>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-slate-50"
        >
          ← ホームに戻る
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-600">
        読み込みファイル:{" "}
        <code className="font-mono text-slate-800">{SAMPLE_MODEL_PATH}</code>
        　（<code className="font-mono">public/models/sample.glb</code> を配置すると表示されます）
      </div>

      <div className="min-h-0 flex-1" style={{ height: "calc(100vh - 220px)" }}>
        <GLBViewer modelPath={SAMPLE_MODEL_PATH} />
      </div>
    </section>
  );
}
