export function formatDate(value: string) {
  return value;
}

export function formatProgress(done: number, total: number) {
  return `${done} / ${total}`;
}

// --- ラベル変換 ---

const MEMBER_KIND_LABELS: Record<string, string> = {
  column: "柱",
  beam: "梁",
  brace: "ブレース",
  other: "その他",
};

const MEMBER_STATUS_LABELS: Record<string, string> = {
  pending: "未着手",
  in_progress: "検査中",
  done: "完了",
};

const INSPECTION_RESULT_LABELS: Record<string, string> = {
  ok: "合格",
  ng: "不合格",
  recheck: "再検査",
};

export function formatMemberKind(kind: string): string {
  return MEMBER_KIND_LABELS[kind] ?? kind;
}

export function formatMemberStatus(status: string): string {
  return MEMBER_STATUS_LABELS[status] ?? status;
}

export function formatInspectionResult(result: string): string {
  return INSPECTION_RESULT_LABELS[result] ?? result;
}
