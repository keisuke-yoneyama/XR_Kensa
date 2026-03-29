import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";
import {
  downloadFromStorage,
  uploadToStorage,
  updateAssetStatus,
} from "./supabase";

const execFileAsync = promisify(execFile);

const IFCCONVERT_PATH = process.env.IFCCONVERT_PATH || "/usr/local/bin/IfcConvert";

interface ConvertRequest {
  assetId: string;
  projectId: string;
  ifcPath: string;
  callbackUrl?: string;
}

interface ConvertResult {
  success: boolean;
  glbPath?: string;
  glbSizeBytes?: number;
  error?: string;
}

/**
 * IFC → GLB 変換を実行する。
 *
 * 1. Storage から IFC をダウンロード
 * 2. IfcConvert CLI で GLB に変換
 * 3. GLB を Storage にアップロード
 * 4. model_assets の status を更新
 * 5. (オプション) callback URL に結果を通知
 */
export async function convertIfcToGlb(req: ConvertRequest): Promise<ConvertResult> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ifc-convert-"));
  const inputPath = path.join(tmpDir, "input.ifc");
  const outputPath = path.join(tmpDir, "output.glb");

  try {
    // ステータスを converting に更新
    await updateAssetStatus(req.assetId, "converting");

    // 1. Storage から IFC をダウンロード
    console.log(`[convert] IFC ダウンロード中: ${req.ifcPath}`);
    await downloadFromStorage(req.ifcPath, inputPath);

    // 2. IfcConvert CLI で変換
    console.log(`[convert] IfcConvert 実行中...`);
    try {
      const { stdout, stderr } = await execFileAsync(IFCCONVERT_PATH, [
        inputPath,
        outputPath,
      ], {
        timeout: 600_000, // 10分タイムアウト
      });
      if (stdout) console.log(`[convert] stdout: ${stdout}`);
      if (stderr) console.warn(`[convert] stderr: ${stderr}`);
    } catch (execErr) {
      const msg = execErr instanceof Error ? execErr.message : String(execErr);
      throw new Error(`IfcConvert 実行失敗: ${msg}`);
    }

    // 変換結果の確認
    if (!fs.existsSync(outputPath)) {
      throw new Error("IfcConvert が GLB ファイルを出力しませんでした。");
    }

    // 3. GLB を Storage にアップロード
    const ifcFilename = path.basename(req.ifcPath, ".ifc");
    const glbPath = `${req.projectId}/glb/${ifcFilename}.glb`;
    console.log(`[convert] GLB アップロード中: ${glbPath}`);
    const glbSizeBytes = await uploadToStorage(outputPath, glbPath);

    // 4. model_assets を更新
    await updateAssetStatus(req.assetId, "completed", {
      glbPath,
      glbSizeBytes,
    });

    console.log(`[convert] 変換完了: ${glbPath} (${glbSizeBytes} bytes)`);

    // 5. callback URL に通知
    if (req.callbackUrl) {
      try {
        await fetch(req.callbackUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Converter-Api-Key": process.env.CONVERTER_API_KEY || "",
          },
          body: JSON.stringify({
            assetId: req.assetId,
            status: "completed",
            glbPath,
            glbSizeBytes,
          }),
        });
      } catch (cbErr) {
        console.error("[convert] callback 通知失敗:", cbErr);
      }
    }

    return { success: true, glbPath, glbSizeBytes };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[convert] 変換失敗: ${errorMsg}`);

    // model_assets を failed に更新
    await updateAssetStatus(req.assetId, "failed", {
      conversionError: errorMsg,
    });

    // callback URL にエラー通知
    if (req.callbackUrl) {
      try {
        await fetch(req.callbackUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Converter-Api-Key": process.env.CONVERTER_API_KEY || "",
          },
          body: JSON.stringify({
            assetId: req.assetId,
            status: "failed",
            error: errorMsg,
          }),
        });
      } catch (cbErr) {
        console.error("[convert] callback エラー通知失敗:", cbErr);
      }
    }

    return { success: false, error: errorMsg };
  } finally {
    // 一時ファイルをクリーンアップ
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // クリーンアップ失敗は無視
    }
  }
}
