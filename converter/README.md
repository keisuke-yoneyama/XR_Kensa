# converter

IFC → GLB 変換サービス。Docker 上で IfcConvert CLI をラップした Express サーバー。

## 概要

- apps/web からの HTTP リクエストで IFC → GLB 変換を実行
- Supabase Storage から IFC をダウンロードし、変換後の GLB をアップロード
- 変換結果は model_assets テーブルに反映

## 前提条件

- Docker / Docker Compose
- Supabase プロジェクト（Storage バケット `models` が作成済み）
- model_assets テーブルが作成済み（`docs/db/005_model_assets.sql`）

## セットアップ

```bash
# 1. 環境変数ファイルを作成
cp .env.example .env
# .env を編集して Supabase の URL / service_role key / API key を設定

# 2. Docker で起動
docker compose up --build

# 3. ヘルスチェック
curl http://localhost:3001/health
```

## API エンドポイント

### POST /convert

IFC → GLB 変換をリクエストする。即座に 202 Accepted を返し、バックグラウンドで変換を実行。

**ヘッダー:**
- `X-Converter-Api-Key`: 認証用 API キー

**リクエストボディ:**
```json
{
  "assetId": "uuid",
  "projectId": "uuid",
  "ifcPath": "{projectId}/ifc/{filename}.ifc",
  "callbackUrl": "https://xxx/api/conversion-callback"
}
```

**レスポンス (202):**
```json
{ "status": "accepted", "assetId": "uuid" }
```

### GET /health

ヘルスチェック。

## 環境変数

| 変数名 | 説明 |
|-------|------|
| `PORT` | サーバーポート（デフォルト: 3001） |
| `SUPABASE_URL` | Supabase プロジェクト URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role キー（サーバーサイド専用） |
| `CONVERTER_API_KEY` | API 認証用の共有シークレット |
| `IFCCONVERT_PATH` | IfcConvert バイナリのパス（デフォルト: /usr/local/bin/IfcConvert） |

## IfcConvert について

- [IfcOpenShell](https://github.com/IfcOpenShell/IfcOpenShell) の CLI ツール
- Dockerfile 内で Linux 版バイナリをダウンロード・インストール
- IFC → GLB の直接変換をサポート

## TODO / 将来拡張

- [ ] IfcConvert のリリース URL / バージョンの確定
- [ ] GLB 出力オプション（`--use-element-guids` 等）の検証
- [ ] mesh 名の抽出と model_assets.mesh_names への保存
- [ ] 変換失敗時のリトライ機構
- [ ] 本番デプロイ先の選定（Railway / Fly.io / VPS）
- [ ] 大規模 IFC 対応（ジョブキュー導入）
