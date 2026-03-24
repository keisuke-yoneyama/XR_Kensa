import Link from "next/link";
import { InspectionList } from "@/components/inspections/inspection-list";
import { PageHeader } from "@/components/ui/page-header";
import { getInspectionsByProjectId } from "@/lib/api/inspections";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProjectInspectionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await createSupabaseServerClient();
  const projectInspections = await getInspectionsByProjectId(id, client);

  return (
    <section className="space-y-4">
      <Link className="inline-flex text-sm font-medium" href={`/projects/${id}`}>
        ← プロジェクト詳細
      </Link>
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          eyebrow="Inspections"
          title="検査一覧"
          description={`プロジェクト ${id} の検査記録（${projectInspections.length} 件）`}
        />
        <Link
          href={`/projects/${id}/inspections/new`}
          className="shrink-0 rounded-lg bg-steel-700 px-4 py-2 text-sm font-medium text-white no-underline"
        >
          検査追加
        </Link>
      </div>
      <InspectionList inspections={projectInspections} />
    </section>
  );
}
