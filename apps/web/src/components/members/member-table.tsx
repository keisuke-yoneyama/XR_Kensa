import Link from "next/link";
import type { Member } from "@/types/member";

export function MemberTable({ members }: { members: Member[] }) {
  if (members.length === 0) {
    return <p className="text-sm text-slate-500">メンバーがいません。</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-4 py-3">Member ID</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {members.map((member) => (
            <tr key={member.id}>
              <td className="px-4 py-3">
                <Link className="font-medium underline hover:text-steel-700" href={`/members/${member.id}`}>
                  {member.id}
                </Link>
              </td>
              <td className="px-4 py-3">{member.kind}</td>
              <td className="px-4 py-3">{member.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
