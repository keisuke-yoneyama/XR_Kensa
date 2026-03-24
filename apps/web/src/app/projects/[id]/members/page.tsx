import Link from "next/link";
import { MemberTable } from "@/components/members/member-table";
import { PageHeader } from "@/components/ui/page-header";
import { getMembersByProjectId } from "@/lib/api/members";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProjectMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await createSupabaseServerClient();
  const projectMembers = await getMembersByProjectId(id, client);

  return (
    <section className="space-y-4">
      <Link className="inline-flex text-sm font-medium" href={`/projects/${id}`}>
        ← プロジェクト詳細
      </Link>
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          eyebrow="Members"
          title="メンバー一覧"
          description={`プロジェクト ${id} の部材（${projectMembers.length} 件）`}
        />
        <Link
          href={`/projects/${id}/members/new`}
          className="shrink-0 rounded-lg bg-steel-700 px-4 py-2 text-sm font-medium text-white no-underline"
        >
          部材追加
        </Link>
      </div>
      <MemberTable members={projectMembers} />
    </section>
  );
}
