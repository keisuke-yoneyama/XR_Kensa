import { MemberDetailCard } from "@/components/members/member-detail-card";
import { PageHeader } from "@/components/ui/page-header";
import { getMemberById } from "@/lib/api/members";

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getMemberById(id);

  return (
    <section className="space-y-4">
      <PageHeader eyebrow="Member detail" title={member?.id ?? id} />
      <MemberDetailCard member={member} />
    </section>
  );
}