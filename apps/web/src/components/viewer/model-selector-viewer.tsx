"use client";

import { useState } from "react";
import { GLBViewer } from "./glb-viewer";
import type { ModelEntry } from "@/lib/model-paths";

interface Props {
  models: ModelEntry[];
}

export function ModelSelectorViewer({ models }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (models.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg bg-slate-900 text-white">
        <div className="p-6 text-center">
          <p className="text-lg font-semibold">モデルが登録されていません</p>
          <p className="mt-2 text-sm text-slate-400">
            <code className="text-slate-300">src/lib/model-paths.ts</code>{" "}
            に GLB ファイルを登録してください
          </p>
        </div>
      </div>
    );
  }

  const selected = models[selectedIndex];

  return (
    <div className="flex h-full flex-col gap-3">
      {models.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {models.map((model, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                i === selectedIndex
                  ? "border-steel-500 bg-steel-500 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              {model.label}
            </button>
          ))}
        </div>
      )}

      {/* key でモデル切替時に GLBViewer を完全リセットし、ErrorBoundary もリセットする */}
      <div className="min-h-0 flex-1">
        <GLBViewer key={selected.path} modelPath={selected.path} />
      </div>
    </div>
  );
}
