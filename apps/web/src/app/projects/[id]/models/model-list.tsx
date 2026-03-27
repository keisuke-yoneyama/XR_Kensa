"use client";

import { useState } from "react";
import { deleteModel } from "./actions";
import type { ModelAsset } from "@/types/model-asset";

interface Props {
  models: ModelAsset[];
  projectId: string;
}

/** conversion_status に応じたバッジ表示 */
function StatusBadge({ status }: { status: ModelAsset["conversionStatus"] }) {
  const config: Record<string, { label: string; className: string }> = {
    direct: { label: "GLB", className: "bg-slate-100 text-slate-600" },
    pending: { label: "変換待ち", className: "bg-yellow-100 text-yellow-700" },
    converting: { label: "変換中", className: "bg-blue-100 text-blue-700" },
    completed: { label: "変換完了", className: "bg-green-100 text-green-700" },
    failed: { label: "変換失敗", className: "bg-red-100 text-red-700" },
  };
  const { label, className } = config[status] ?? config.direct;
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export function ModelList({ models, projectId }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null);

  if (models.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        モデルが登録されていません。左のフォームからアップロードしてください。
      </p>
    );
  }

  async function handleDelete(modelId: string) {
    if (!confirm("このモデルを削除しますか？")) return;
    setDeleting(modelId);
    await deleteModel(modelId, projectId);
    setDeleting(null);
  }

  return (
    <ul className="space-y-3">
      {models.map((model) => (
        <li
          key={model.id}
          className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{model.label}</p>
              <StatusBadge status={model.conversionStatus} />
            </div>
            <p className="text-xs text-slate-400">{model.originalFilename}</p>
            {model.conversionStatus === "failed" && model.conversionError && (
              <p className="text-xs text-red-500">{model.conversionError}</p>
            )}
          </div>
          <button
            onClick={() => handleDelete(model.id)}
            disabled={deleting === model.id}
            className="rounded-lg border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {deleting === model.id ? "削除中..." : "削除"}
          </button>
        </li>
      ))}
    </ul>
  );
}
