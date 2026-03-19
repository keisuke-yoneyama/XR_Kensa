import type { Member } from "@/types/member";

export function MemberDetailCard({ member }: { member?: Member }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <dl className="grid gap-4 md:grid-cols-2">
        <div>
          <dt className="text-sm text-slate-500">Type</dt>
          <dd className="mt-1 font-medium text-slate-900">{member?.kind ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">Status</dt>
          <dd className="mt-1 font-medium text-slate-900">{member?.status ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">Project ID</dt>
          <dd className="mt-1 font-medium text-slate-900">{member?.projectId ?? "-"}</dd>
        </div>
      </dl>
    </div>
  );
}