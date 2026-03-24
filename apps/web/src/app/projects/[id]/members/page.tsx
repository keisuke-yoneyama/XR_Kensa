import Link from "next/link";
import { MemberTable } from "@/components/members/member-table";
import { PageHeader } from "@/components/ui/page-header";
import { getMembersByProjectId } from "@/lib/api/members";

export default async function ProjectMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectMembers = await getMembersByProjectId(id);

  return (
    <section className="space-y-4">
      <Link className="inline-flex text-sm font-medium" href={`/projects/${id}`}>
        ← プロジェクト詳細
      </Link>
      <PageHeader
        eyebrow="Members"
        title="メンバー一覧"
        description={`プロジェクト ${id} のメンバー（${projectMembers.length} 件）`}
      />
      <MemberTable members={projectMembers} />
    </section>
  );
}
