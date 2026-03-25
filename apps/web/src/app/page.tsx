import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-steel-700">Web first</p>
        <h1 className="text-3xl font-semibold">Steel MR Inspection</h1>
        <p className="text-sm text-slate-600">
          Start with a minimal Next.js app and verify project list navigation before connecting apps/api.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium no-underline shadow-sm hover:bg-slate-50"
          href="/projects"
        >
          Open project list
        </Link>
        <Link
          className="inline-flex rounded-lg border border-steel-500 bg-steel-500 px-4 py-2 font-medium text-white no-underline shadow-sm hover:bg-steel-700"
          href="/viewer"
        >
          3D モデルビューア（サンプル）
        </Link>
      </div>
    </section>
  );
}