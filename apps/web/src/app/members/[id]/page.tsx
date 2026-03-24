import Link from "next/link";
import { MemberDetailCard } from "@/components/members/member-detail-card";
import { PageHeader } from "@/components/ui/page-header";
import { getMemberById } from "@/lib/api/members";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await createSupabaseServerClient();
  const member = await getMemberById(id, client);

  if (!member) {
    return (
      <section className="space-y-4">
        <Link className="inline-flex text-sm font-medium" href="/projects">
          ← プロジェクト一覧
        </Link>
        <p className="text-slate-600">メンバーが見つかりません（ID: {id}）</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <Link className="inline-flex text-sm font-medium" href={`/projects/${member.projectId}/members`}>
        ← メンバー一覧
      </Link>
      <PageHeader eyebrow="Member detail" title={member.id} />
      <MemberDetailCard member={member} />
    </section>
  );
}
