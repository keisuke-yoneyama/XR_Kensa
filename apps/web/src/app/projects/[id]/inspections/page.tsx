import Link from "next/link";
import { InspectionList } from "@/components/inspections/inspection-list";
import { PageHeader } from "@/components/ui/page-header";
import { getInspectionsByProjectId } from "@/lib/api/inspections";

export default async function ProjectInspectionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectInspections = await getInspectionsByProjectId(id);

  return (
    <section className="space-y-4">
      <Link className="inline-flex text-sm font-medium" href={`/projects/${id}`}>
        ← プロジェクト詳細
      </Link>
      <PageHeader
        eyebrow="Inspections"
        title="検査一覧"
        description={`プロジェクト ${id} の検査記録（${projectInspections.length} 件）`}
      />
      <InspectionList inspections={projectInspections} />
    </section>
  );
}
