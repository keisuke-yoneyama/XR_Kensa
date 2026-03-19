import type { Inspection } from "@/types/inspection";
import { formatDate } from "@/lib/formatters";

export function InspectionList({ inspections }: { inspections: Inspection[] }) {
  return (
    <div className="grid gap-4">
      {inspections.map((inspection) => (
        <article key={inspection.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-semibold text-slate-900">{inspection.memberId}</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{inspection.result}</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">Date: {formatDate(inspection.inspectedAt)}</p>
        </article>
      ))}
    </div>
  );
}