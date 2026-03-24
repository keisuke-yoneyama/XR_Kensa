import type { Member } from "@/types/member";
import { formatMemberKind, formatMemberStatus } from "@/lib/formatters";

export function MemberDetailCard({ member }: { member?: Member }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <dl className="grid gap-4 md:grid-cols-2">
        <div>
          <dt className="text-sm text-slate-500">種別</dt>
          <dd className="mt-1 font-medium text-slate-900">
            {member ? formatMemberKind(member.kind) : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">検査状況</dt>
          <dd className="mt-1 font-medium text-slate-900">
            {member ? formatMemberStatus(member.status) : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">工事 ID</dt>
          <dd className="mt-1 font-medium text-slate-900">{member?.projectId ?? "-"}</dd>
        </div>
      </dl>
    </div>
  );
}
