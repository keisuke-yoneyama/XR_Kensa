"use client";

import { useState, useRef } from "react";
import { uploadModel } from "./actions";

interface Props {
  projectId: string;
}

export function ModelUploadForm({ projectId }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set("projectId", projectId);

    const result = await uploadModel(formData);

    if (result.success) {
      // ファイル種別に応じたメッセージ
      const file = formData.get("file") as File | null;
      const isIfc = file?.name.endsWith(".ifc");
      const text = isIfc
        ? "IFC ファイルをアップロードしました。GLB への変換を開始します。"
        : "アップロードが完了しました。";
      setMessage({ type: "success", text });
      formRef.current?.reset();
    } else {
      setMessage({ type: "error", text: result.error });
    }
    setLoading(false);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="label" className="block text-sm font-medium text-slate-700">
          モデル名（表示ラベル）
        </label>
        <input
          id="label"
          name="label"
          type="text"
          required
          placeholder="例: 全体モデル"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-steel-500 focus:outline-none focus:ring-1 focus:ring-steel-500"
        />
      </div>

      <div>
        <label htmlFor="file" className="block text-sm font-medium text-slate-700">
          モデルファイル（GLB / IFC）
        </label>
        <input
          id="file"
          name="file"
          type="file"
          required
          accept=".glb,.ifc"
          className="mt-1 w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-steel-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-steel-700 hover:file:bg-steel-100"
        />
        <p className="mt-1 text-xs text-slate-400">
          GLB はそのまま表示されます。IFC はアップロード後に自動で GLB に変換されます。
        </p>
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-steel-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-steel-700 disabled:opacity-50"
      >
        {loading ? "アップロード中..." : "アップロード"}
      </button>
    </form>
  );
}
