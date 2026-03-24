import Link from "next/link";
import type { Inspection } from "@/types/inspection";
import { formatDate, formatInspectionResult, formatMemberKind } from "@/lib/formatters";

const RESULT_STYLES: Record<string, string> = {
  ok: "bg-green-100 text-green-700",
  ng: "bg-red-100 text-red-700",
  recheck: "bg-yellow-100 text-yellow-700",
};

type Props = {
  inspections: Inspection[];
  projectId: string;
};

export function InspectionList({ inspections, projectId }: Props) {
  if (inspections.length === 0) {
    return <p className="text-sm text-slate-500">検査記録がまだありません。</p>;
  }

  return (
    <div className="grid gap-4">
      {inspections.map((inspection) => (
        <article key={inspection.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400">部材種別</p>
              <h3 className="font-semibold text-slate-900">{formatMemberKind(inspection.memberKind)}</h3>
              <p className="mt-0.5 text-xs text-slate-400">ID: {inspection.memberId.slice(0, 8)}…</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${RESULT_STYLES[inspection.result] ?? "bg-slate-100 text-slate-700"}`}
            >
              {formatInspectionResult(inspection.result)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-slate-600">検査日: {formatDate(inspection.inspectedAt)}</p>
            <Link
              href={`/projects/${projectId}/inspections/${inspection.id}/edit`}
              className="text-xs font-medium text-steel-500 hover:text-steel-700"
            >
              編集
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
