import { MemberTable } from "@/components/members/member-table";
import { PageHeader } from "@/components/ui/page-header";
import { getMembersByProjectId } from "@/lib/api/members";

export default async function ProjectMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectMembers = await getMembersByProjectId(id);

  return (
    <section className="space-y-4">
      <PageHeader title="Members" description={`List of members for ${id}.`} />
      <MemberTable members={projectMembers} />
    </section>
  );
}