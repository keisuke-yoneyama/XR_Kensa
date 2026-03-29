import express from "express";
import { convertIfcToGlb } from "./convert";

const app = express();
app.use(express.json());

const PORT = parseInt(process.env.PORT || "3001", 10);
const API_KEY = process.env.CONVERTER_API_KEY;

/**
 * API キー認証ミドルウェア
 */
function authenticateApiKey(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  if (!API_KEY) {
    // API_KEY 未設定の場合はスキップ（ローカル開発用）
    next();
    return;
  }
  const providedKey = req.headers["x-converter-api-key"];
  if (providedKey !== API_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

/**
 * POST /convert
 *
 * IFC → GLB 変換を実行する。
 * リクエストを受け取ったら即座に 202 Accepted を返し、
 * バックグラウンドで変換処理を実行する。
 */
app.post("/convert", authenticateApiKey, (req, res) => {
  const { assetId, projectId, ifcPath, callbackUrl } = req.body;

  if (!assetId || !projectId || !ifcPath) {
    res.status(400).json({
      error: "assetId, projectId, ifcPath は必須です。",
    });
    return;
  }

  // 即座にレスポンスを返す（非同期処理はバックグラウンド）
  res.status(202).json({ status: "accepted", assetId });

  // バックグラウンドで変換処理を実行
  convertIfcToGlb({ assetId, projectId, ifcPath, callbackUrl }).catch((err) => {
    console.error("[/convert] 未処理エラー:", err);
  });
});

/**
 * GET /health
 *
 * ヘルスチェック用エンドポイント
 */
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`[converter] サーバー起動: http://localhost:${PORT}`);
  console.log(`[converter] IfcConvert パス: ${process.env.IFCCONVERT_PATH || "/usr/local/bin/IfcConvert"}`);
});
