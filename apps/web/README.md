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

### 3. RLS の設定（フェーズ2: ユーザー単位の絞り込み）

フェーズ2では `projects` に `owner_user_id` カラムを追加し、
**ログイン中のユーザーが作成した projects のみ** read/write できるように RLS を設定します。

Supabase ダッシュボード > **SQL Editor** で以下を**順番通りに**実行してください。

#### ステップ 1: カラム追加

```sql
alter table projects
  add column if not exists owner_user_id uuid references auth.users(id);
```

#### ステップ 2: 既存データの owner_user_id を埋める

> **重要**: このステップを省略すると、既存レコードが `owner_user_id = NULL` のままになり、
> 新 RLS 適用後に誰も見えなくなります。必ず実行してください。

Supabase ダッシュボード > **Authentication > Users** からあなたのユーザー UUID をコピーし、
`'<your-user-id>'` を置き換えて実行してください。

```sql
-- 既存レコードをすべて自分の UUID に紐付ける
update projects
  set owner_user_id = '<your-user-id>'
  where owner_user_id is null;
```

#### ステップ 3: 古い policy を削除

```sql
drop policy if exists "authenticated users can select projects" on projects;
drop policy if exists "authenticated users can insert projects" on projects;
drop policy if exists "authenticated users can update projects" on projects;
```

#### ステップ 4: ユーザー単位の policy を作成

```sql
-- RLS が無効な場合は有効化（すでに有効なら不要だがべき等なので実行してよい）
alter table projects enable row level security;

-- 自分が作成した projects のみ SELECT 可
create policy "users can select own projects"
  on projects for select
  to authenticated
  using (owner_user_id = auth.uid());

-- INSERT 時に owner_user_id = ログイン中ユーザーであることを強制
create policy "users can insert own projects"
  on projects for insert
  to authenticated
  with check (owner_user_id = auth.uid());

-- 自分が作成した projects のみ UPDATE 可
create policy "users can update own projects"
  on projects for update
  to authenticated
  using (owner_user_id = auth.uid());
```

---

### 4. RLS の設定（フェーズ2: members / inspections への展開）

`members` と `inspections` は `project_id` を通じて親の `projects` を参照しています。
そのため、`owner_user_id` カラムを子テーブルに追加せず、
**project_id → projects.owner_user_id の JOIN** でオーナーを判定します。

- 所有権は親の `projects` テーブルに一元管理される
- 親の所有者を変えれば子は自動追従する
- insert コードに `owner_user_id` を渡す必要がない

Supabase ダッシュボード > **SQL Editor** で以下を実行してください。

```sql
-- members: project_id 経由で親プロジェクトのオーナーを確認
alter table members enable row level security;

create policy "users can select own members"
  on members for select to authenticated
  using (
    exists (
      select 1 from projects
      where projects.id = members.project_id
        and projects.owner_user_id = auth.uid()
    )
  );

create policy "users can insert into own project members"
  on members for insert to authenticated
  with check (
    exists (
      select 1 from projects
      where projects.id = project_id
        and projects.owner_user_id = auth.uid()
    )
  );

create policy "users can update own members"
  on members for update to authenticated
  using (
    exists (
      select 1 from projects
      where projects.id = members.project_id
        and projects.owner_user_id = auth.uid()
    )
  );

-- inspections: 同様に project_id 経由で判定
alter table inspections enable row level security;

create policy "users can select own inspections"
  on inspections for select to authenticated
  using (
    exists (
      select 1 from projects
      where projects.id = inspections.project_id
        and projects.owner_user_id = auth.uid()
    )
  );

create policy "users can insert into own project inspections"
  on inspections for insert to authenticated
  with check (
    exists (
      select 1 from projects
      where projects.id = project_id
        and projects.owner_user_id = auth.uid()
    )
  );

create policy "users can update own inspections"
  on inspections for update to authenticated
  using (
    exists (
      select 1 from projects
      where projects.id = inspections.project_id
        and projects.owner_user_id = auth.uid()
    )
  );
```

> **既存データ移行は不要です。** `owner_user_id` カラムを追加していないため、
> SQL を実行するだけで RLS が有効になります。

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
| projects テーブルの RLS           | ✅ 実装済み（owner_user_id 単位で絞り込み） |
| members / inspections の RLS      | ✅ 実装済み（project_id 経由で親の owner 判定） |
| ユーザー単位のデータ絞り込み      | ✅ 実装済み（owner_user_id = auth.uid()）   |
| 新規ユーザー登録（アプリ内）      | 未実装（Supabase ダッシュボードから手動登録） |

---

## 今後の予定（フェーズ3以降）

- アプリ内でのユーザー新規登録フォーム（現在は Supabase ダッシュボードから手動登録）
- BIM/IFC データ連携・AR/XR 連携
- inspections 入力・更新 UI の強化
