# apps/web

鉄骨FAB向け検査支援システムの Web 管理画面です。
Next.js App Router + TypeScript + Tailwind CSS で構成されています。
現在はフェーズ1で、モックデータで画面遷移を確認できる状態です。Supabase 接続はまだ行っていません。

---

## ローカル起動手順

### 前提

- Node.js 18 以上

### 手順

```bash
# 1. apps/web ディレクトリに移動
cd apps/web

# 2. 既存の node_modules を削除（zip 展開後や環境が壊れている場合）
rm -rf node_modules .next

# 3. 依存関係をインストール
npm install

# 4. 開発サーバーを起動
npm run dev
```

起動後、ブラウザで `http://localhost:3000` を開いてください。

---

## 確認すべきページ

| URL | 内容 |
|-----|------|
| `/` | ホーム（プロジェクト一覧へのリンク） |
| `/projects` | プロジェクト一覧 |
| `/projects/project-001` | プロジェクト詳細（メンバー・検査へのリンクあり） |
| `/projects/project-001/members` | プロジェクトのメンバー一覧 |
| `/projects/project-001/inspections` | プロジェクトの検査一覧 |
| `/members/member-001` | メンバー詳細 |

モックデータには `project-001` ～ `project-004` が存在します。

---

## 画面遷移の導線

```
/ → /projects
/projects → /projects/[id]
/projects/[id] → /projects/[id]/members
/projects/[id] → /projects/[id]/inspections
/projects/[id]/members → /members/[id]
/members/[id] → /projects/[id]/members（元のプロジェクトに戻る）
```

---

## モックデータの場所

`src/lib/mock-data.ts` がデータの唯一の参照元です。
`src/lib/api/*.ts` はこのファイルからデータを取得し、将来の API 差し替えの窓口になります。

---

## 今後の予定（フェーズ1以降）

- Supabase テーブル作成・接続
- 認証の本実装
- apps/api との連携
- BIM/IFC データ連携、AR/XR 連携
