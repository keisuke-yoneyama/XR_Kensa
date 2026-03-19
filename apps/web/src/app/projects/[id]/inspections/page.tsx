import { InspectionList } from "@/components/inspections/inspection-list";
import { PageHeader } from "@/components/ui/page-header";
import { getInspectionsByProjectId } from "@/lib/api/inspections";

export default async function ProjectInspectionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectInspections = await getInspectionsByProjectId(id);

  return (
    <section className="space-y-4">
      <PageHeader title="Inspections" description={`Inspection list for ${id}.`} />
      <InspectionList inspections={projectInspections} />
    </section>
  );
}