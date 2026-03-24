# apps/web

鉄骨FAB向け検査支援システムの Web 管理画面です。
Next.js App Router + TypeScript + Tailwind CSS + Supabase で構成されています。
現在はフェーズ1で、projects / members / inspections テーブルが Supabase に接続済みです。

---

## ローカル起動手順

### 前提

- Node.js 18 以上
- Supabase プロジェクトが作成済みであること

### 手順

```bash
# 1. apps/web ディレクトリに移動
cd apps/web

# 2. 既存の node_modules を削除（zip 展開後や環境が壊れている場合）
rm -rf node_modules .next

# 3. 依存関係をインストール
npm install

# 4. 環境変数を設定（.env.local.example をコピーして編集）
cp .env.local.example .env.local
# .env.local を開いて NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定

# 5. 開発サーバーを起動
npm run dev
```

起動後、ブラウザで `http://localhost:3000` を開いてください。

---

## 環境変数

`.env.local` に以下を設定してください（`.env.local.example` を参照）。

| 変数名                          | 取得場所                                                   |
| ------------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase ダッシュボード > Settings > API > Project URL     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase ダッシュボード > Settings > API > anon public key |

---

## Supabase セットアップ（初回のみ）

### 1. テーブルを作成する

Supabase ダッシュボード > **SQL Editor** を開き、以下の SQL を実行してください。

```sql
-- projects テーブル
create table if not exists projects (
  id           uuid        primary key default gen_random_uuid(),
  project_code text        not null,
  project_name text        not null,
  status       text        not null default 'active',
  version      text        not null default '1.0',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- members テーブル（projects に従属）
create table if not exists members (
  id          uuid        primary key default gen_random_uuid(),
  project_id  uuid        not null references projects(id) on delete cascade,
  member_kind text        not null,              -- 部材種別: column / beam / brace / other
  status      text        not null default 'pending', -- pending / in_progress / done
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- inspections テーブル（members に従属）
create table if not exists inspections (
  id           uuid        primary key default gen_random_uuid(),
  project_id   uuid        not null references projects(id) on delete cascade,
  member_id    uuid        not null references members(id) on delete cascade,
  result       text        not null,             -- ok / ng / recheck
  inspected_at date        not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- updated_at を自動更新するトリガー関数（共通）
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on projects
  for each row execute procedure update_updated_at();

create trigger members_updated_at
  before update on members
  for each row execute procedure update_updated_at();

create trigger inspections_updated_at
  before update on inspections
  for each row execute procedure update_updated_at();

-- インデックス
create index if not exists idx_projects_project_code    on projects(project_code);
create index if not exists idx_projects_created_at      on projects(created_at desc);
create index if not exists idx_members_project_id       on members(project_id);
create index if not exists idx_inspections_project_id   on inspections(project_id);
create index if not exists idx_inspections_member_id    on inspections(member_id);
```

### 2. Supabase Auth の有効化

Supabase ダッシュボードで以下を確認・設定してください。

1. **Authentication > Providers > Email** を開く
2. **Enable Email provider** がオンになっていることを確認
3. **Confirm email** は開発中は OFF でも動作します（OFF 推奨：確認メール不要になる）
4. ユーザーを登録するには:
   - Supabase ダッシュボード > **Authentication > Users > Add user** から手動追加
   - またはアプリ側で `supabase.auth.signUp()` を実装して自動登録（今回は未実装）

### 3. RLS の設定

フェーズ1の認証実装に合わせて、`projects` テーブルに最小限の RLS を設定します。
Supabase ダッシュボード > **SQL Editor** で以下を実行してください。

```sql
-- ① projects テーブルの RLS を有効化
alter table projects enable row level security;

-- ② ログイン済みユーザーのみ SELECT 可
create policy "authenticated users can select projects"
  on projects
  for select
  to authenticated
  using (true);

-- ③ ログイン済みユーザーのみ INSERT 可
create policy "authenticated users can insert projects"
  on projects
  for insert
  to authenticated
  with check (true);

-- ④ ログイン済みユーザーのみ UPDATE 可
create policy "authenticated users can update projects"
  on projects
  for update
  to authenticated
  using (true);
```

> **注意**: members / inspections は現時点では RLS 無効のままです。
> 本格展開時に改めて設定してください。

```sql
-- members / inspections は現在 RLS 無効（フェーズ1）
alter table members      disable row level security;
alter table inspections  disable row level security;
```

---

## 認証の使い方

### ログイン

1. `http://localhost:3000/login` にアクセス
2. Supabase Auth に登録済みのメールアドレスとパスワードを入力
3. 「ログイン」ボタンを押す
4. 成功すると `/projects` にリダイレクトされる

### ログイン状態の確認

- ヘッダー右上にログイン中のメールアドレスと「ログアウト」ボタンが表示される
- 未ログイン時はヘッダー右上に「ログイン」リンクが表示される

### ログアウト

- ヘッダー右上の「ログアウト」ボタンをクリック
- `/login` にリダイレクトされる

### アクセス制御

- `/projects` 以下のすべてのページは **ログイン必須**
- 未ログイン状態で `/projects` にアクセスすると `/login` に自動リダイレクト
- ミドルウェア（`src/middleware.ts`）が `/projects/:path*` に一致するリクエストを保護

---

## 動作確認手順

| URL                               | 内容                                              |
| --------------------------------- | ------------------------------------------------- |
| `/`                               | ホーム                                            |
| `/login`                          | ログイン画面（Email + Password）                  |
| `/projects`                       | 工事一覧（**ログイン必須**、Supabase から取得）   |
| `/projects/new`                   | 新規工事登録フォーム（**ログイン必須**）          |
| `/projects/{id}`                  | 工事詳細（部材数も DB から取得）                  |
| `/projects/{id}/members`          | 部材一覧（Supabase から取得）                     |
| `/projects/{id}/members/new`      | 部材追加フォーム                                  |
| `/projects/{id}/inspections`      | 検査一覧（Supabase から取得）                     |
| `/projects/{id}/inspections/new`  | 検査記録追加フォーム                              |
| `/members/{id}`                   | 部材詳細（Supabase から取得）                     |

### 未ログイン時の挙動

- `/projects` にアクセス → `/login` に自動リダイレクト
- ヘッダーに「ログイン」リンクが表示される

### ログイン時の挙動

- `/projects` にアクセス → 工事一覧が表示される
- ヘッダーにメールアドレスと「ログアウト」ボタンが表示される
- RLS が有効の場合、Supabase のクエリも認証済みロールで実行される

### ローカルでの一連確認手順

1. `npm run dev` で起動
2. ブラウザで `/projects` にアクセス → `/login` にリダイレクトされることを確認
3. Supabase Auth に登録済みのアカウントでログイン
4. `/projects` に遷移し、工事一覧が表示されることを確認
5. ヘッダーにメールアドレスと「ログアウト」ボタンが表示されることを確認
6. 「ログアウト」をクリック → `/login` に遷移することを確認
7. 再度 `/projects` にアクセス → `/login` にリダイレクトされることを確認

---

## status / kind の候補値

**projects.status**

| 値          | 意味   |
| ----------- | ------ |
| `draft`     | 下書き |
| `active`    | 進行中 |
| `on_hold`   | 保留   |
| `completed` | 完了   |

**members.status**

| 値            | 意味   |
| ------------- | ------ |
| `pending`     | 未着手 |
| `in_progress` | 検査中 |
| `done`        | 完了   |

**members.member_kind**

| 値       | 意味       |
| -------- | ---------- |
| `column` | 柱         |
| `beam`   | 梁         |
| `brace`  | ブレース   |
| `other`  | その他     |

---

## 現在の DB 接続状況

| リソース             | 状態                 |
| -------------------- | -------------------- |
| projects テーブル    | ✅ Supabase 接続済み |
| members テーブル     | ✅ Supabase 接続済み |
| inspections テーブル | ✅ Supabase 接続済み |

---

## 現在の認証・RLS 実装状況

| 機能                              | 状態                                         |
| --------------------------------- | -------------------------------------------- |
| Email + Password ログイン         | ✅ 実装済み（`/login`）                      |
| ログアウト                        | ✅ 実装済み（ヘッダーのボタン）              |
| /projects ルートの認証ガード      | ✅ 実装済み（middleware.ts）                 |
| projects テーブルの RLS           | 要設定（上記「RLS の設定」の SQL を実行）    |
| members / inspections の RLS      | 未実装（フェーズ2以降）                      |
| ユーザー単位のデータ絞り込み      | 未実装（owner_user_id カラム追加が必要）     |
| 新規ユーザー登録（アプリ内）      | 未実装（Supabase ダッシュボードから手動登録） |

---

## 今後の予定（フェーズ2以降）

- ユーザー単位でのデータ絞り込み（projects に `owner_user_id` カラム追加）
- members / inspections への RLS 本格適用
- アプリ内でのユーザー新規登録フォーム
- BIM/IFC データ連携・AR/XR 連携
