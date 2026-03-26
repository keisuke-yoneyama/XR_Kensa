"use client";

import { useState } from "react";
import { deleteModel } from "./actions";
import type { ProjectModel } from "@/lib/storage/models";

interface Props {
  models: ProjectModel[];
  projectId: string;
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
          <div>
            <p className="text-sm font-medium">{model.label}</p>
            <p className="text-xs text-slate-400">{model.storagePath}</p>
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
