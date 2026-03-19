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

      <Link
        className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium no-underline shadow-sm"
        href="/projects"
      >
        Open project list
      </Link>
    </section>
  );
}