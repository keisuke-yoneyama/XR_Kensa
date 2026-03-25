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

| 変数名                          | 取得場所                                                          | 用途                       |
| ------------------------------- | ----------------------------------------------------------------- | -------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase ダッシュボード > Settings > API > Project URL            | 全クライアント共通          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase ダッシュボード > Settings > API > anon public key        | ブラウザ用クライアント      |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase ダッシュボード > Settings > API > service_role (secret)  | **サーバーサイド専用**      |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` は `NEXT_PUBLIC_` を絶対に付けないこと。
> 付けるとブラウザに漏れ、全 RLS をバイパスされる危険があります。
> `.env.local` を git にコミットしないこと（`.gitignore` で除外されているはず）。

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

### ユーザー登録（管理者用）

> **前提**: `/admin/users/new` にアクセスするには `app_metadata.role = "admin"` が必要です。
> 初回は下記「既存ユーザーに管理者権限を付与する」を先に実行してください。

1. 管理者アカウントでログインした状態で `http://localhost:3000/admin/users/new` にアクセス
2. メールアドレス・パスワード・表示名（任意）を入力
3. 管理者として登録する場合は「管理者権限を付与する」チェックボックスをオンにする
4. 「登録する」ボタンを押す
5. 登録成功後、そのアカウントで `/login` からログインできる

> **事前準備**: `.env.local` に `SUPABASE_SERVICE_ROLE_KEY` を設定すること（上記「環境変数」参照）。
> 未設定の場合はエラーになります。

### 既存ユーザーに管理者権限を付与する

Supabase ダッシュボード > **SQL Editor** で以下を実行してください。

```sql
-- 対象ユーザーのメールアドレスを指定する
update auth.users
  set raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
  where email = 'your-admin-email@example.com';
```

実行後、対象ユーザーは **ログアウト → 再ログイン** を行ってください（セッションを更新するため）。

### ロール設計の考え方

| ロール | `app_metadata.role` | `/admin` アクセス |
| ------ | ------------------- | ----------------- |
| 管理者 | `"admin"`           | ✅ 可能           |
| 一般   | `"member"`          | ❌ `/projects` へリダイレクト |

- `app_metadata` はユーザー自身が書き換えられない（service_role のみ変更可）
- `user_metadata` はユーザー自身が `updateUser()` で書き換えられるため、ロール管理には使わない
- ミドルウェア（`src/middleware.ts`）が `user.app_metadata?.role` を確認してリダイレクトを判定する

### アクセス制御

- `/projects` 以下: **ログイン必須**（未ログイン → `/login` にリダイレクト）
- `/admin` 以下: **ログイン必須 かつ `app_metadata.role = "admin"` 必須**（非管理者 → `/projects` にリダイレクト）
- ミドルウェア（`src/middleware.ts`）が `/projects/:path*` と `/admin/:path*` を保護

---

## 動作確認手順

| URL                               | 内容                                              |
| --------------------------------- | ------------------------------------------------- |
| `/`                               | ホーム                                            |
| `/login`                          | ログイン画面（Email + Password）                  |
| `/admin/users/new`                | ユーザー登録（**ログイン必須**、管理者用）        |
| `/projects`                       | 工事一覧（**ログイン必須**、Supabase から取得）   |
| `/projects/new`                   | 新規工事登録フォーム（**ログイン必須**）          |
| `/projects/{id}`                  | 工事詳細（部材数も DB から取得）                  |
| `/projects/{id}/members`          | 部材一覧（Supabase から取得）                     |
| `/projects/{id}/members/new`      | 部材追加フォーム                                  |
| `/projects/{id}/inspections`                    | 検査一覧（部材種別・日付表示）                    |
| `/projects/{id}/inspections/new`                | 検査記録追加フォーム                              |
| `/projects/{id}/inspections/{inspectionId}/edit`| 検査記録編集フォーム                              |
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
| 新規ユーザー登録（アプリ内）      | ✅ 実装済み（`/admin/users/new`、管理者用）  |
| /admin ルートの管理者専用ガード   | ✅ 実装済み（`app_metadata.role = "admin"` で判定） |

---

## GLB サンプル表示（フェーズ2.5）

Web 上で GLB 形式の 3D モデルを表示できる最小構成を追加しました。

### 表示ページ

| URL       | 内容                                  |
| --------- | ------------------------------------- |
| `/viewer` | GLB サンプルビューア（認証不要で確認可） |

ホームページ (`/`) にビューアへのリンクボタンも追加しています。

### 使用ライブラリ

| パッケージ              | 用途                                              |
| ----------------------- | ------------------------------------------------- |
| `three`                 | WebGL 3D レンダリング基盤                         |
| `@react-three/fiber`    | Three.js の React ラッパー（Canvas/宣言的 3D UI） |
| `@react-three/drei`     | OrbitControls / useGLTF / Grid など便利な抽象     |

**drei を選んだ理由**: `useGLTF`（GLB読み込み）・`OrbitControls`・`Html`（Canvas内DOM）・`Grid` などが1パッケージで揃い、最小コードで動作確認できるため。

### GLB ファイルの置き場所

```
apps/web/
  public/
    models/
      sample.glb   ← ここに配置する
```

- `public/models/` に `sample.glb` という名前で置くと、`/viewer` ページで読み込まれます
- サンプルが無い場合は [Khronos glTF サンプル](https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0) から `.glb` を入手してください
- 大きなバイナリを git 管理しないよう、`*.glb` を `.gitignore` に追記することを推奨します

詳細は `public/models/README.md` を参照してください。

### ローカルでの確認手順

```bash
# 1. GLB ファイルを配置
cp your-model.glb apps/web/public/models/sample.glb

# 2. 開発サーバーを起動
cd apps/web
npm run dev

# 3. ブラウザで開く
# http://localhost:3000/viewer
```

### 読み込み失敗時に確認すべき点

1. **ファイルが存在するか**: `public/models/sample.glb` が正しく配置されているか確認
2. **ファイル形式**: `.glb`（バイナリ GLTF）であること（`.gltf` テキスト形式は別途対応が必要）
3. **ブラウザコンソール**: 404 / CORS エラーが出ていないか確認
4. **ファイルサイズ**: 極端に大きいファイルはブラウザが読み込めない場合があります

画面上には「モデルの読み込みに失敗しました」とメッセージが表示されます。

### コンポーネント構成

```
src/
  app/
    viewer/
      page.tsx                    # /viewer ページ（サーバーコンポーネント）
  components/
    viewer/
      glb-viewer.tsx              # GLBViewer クライアントコンポーネント
      error-boundary.tsx          # React ErrorBoundary
```

### プロジェクト別 3D ビューア

各工事プロジェクトの詳細ページから 3D モデルを開けます。

| URL                          | 内容                                       |
| ---------------------------- | ------------------------------------------ |
| `/projects/{id}/viewer`      | プロジェクト紐づけビューア（ログイン必須）  |

**ナビゲーション**: `/projects/{id}` の「3D モデルを見る」ボタンから遷移できます。

#### プロジェクトに GLB を紐づける手順

1. GLB ファイルを `public/models/` に配置する（例: `public/models/sample.glb`）
2. `src/lib/model-paths.ts` の `MODEL_PATHS` に project ID とパスを追記する

```ts
// src/lib/model-paths.ts
const MODEL_PATHS: Record<string, string> = {
  "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx": "/models/my-project.glb",
};
```

- project ID は `/projects/{id}` の URL か Supabase ダッシュボードで確認できます
- 未登録のプロジェクトはフォールバックとして `/models/sample.glb` を表示します

#### モデル URL の解決順

viewer ページは以下の優先順で GLB の参照先を決定します。

```
1. Supabase Storage の署名付き URL（{project_id}.glb が存在する場合）
2. src/lib/model-paths.ts のローカルパス設定（開発用フォールバック）
3. /models/sample.glb（未登録時のサンプル表示）
```

バナー表示でどのソースを使っているか確認できます。

### Supabase Storage 連携

GLB ファイルを Supabase Storage に置くと、viewer が自動で署名付き URL に切り替わります。

#### 1. バケットを作成する

Supabase ダッシュボード > **Storage** を開き、以下の設定でバケットを作成してください。

| 項目 | 値 |
| ---- | -- |
| バケット名 | `models` |
| Public | **オフ**（private バケット推奨） |

#### 2. RLS ポリシーを設定する

Private バケットでは、ログイン済みユーザーのみが読み取れるよう RLS を設定します。

Supabase ダッシュボード > **Storage > Policies** で `models` バケットに以下を追加してください。

```sql
-- ログイン済みユーザーは models バケットを読み取り可能
create policy "authenticated users can read models"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'models');
```

#### 3. GLB ファイルをアップロードする

Supabase ダッシュボード > **Storage > models** から GLB をアップロードします。

**ファイル名の規則**: `{project_id}.glb`

```
例: 65166a2e-213b-49f1-bae2-ca02a9fb72a8.glb
```

project ID は `/projects/{id}` の URL または Supabase ダッシュボードの `projects` テーブルで確認できます。

#### 4. 動作確認

```bash
npm run dev
# http://localhost:3000/projects/{id}/viewer を開く
# バナーが表示されなければ Storage から正常に読み込めています
```

#### 仕組みと注意点

- 署名付き URL はサーバーコンポーネントで発行（有効期限 1時間）
- ページ読み込みのたびに新しい URL が発行されるため期限切れは発生しない
- Storage にファイルがない場合は `console.warn` を出してローカル/サンプルにフォールバックする
- Storage の RLS を「authenticated only」にしているため、未ログイン状態では取得できない

#### 関連ファイル

| ファイル | 役割 |
| -------- | ---- |
| `src/lib/storage/models.ts` | Storage から署名付き URL を取得するヘルパー |
| `src/lib/model-paths.ts` | ローカル開発用フォールバックマッピング |
| `src/app/projects/[id]/viewer/page.tsx` | Storage → ローカル → サンプル の順で解決 |

### 今回未対応のこと

- IFC ファイルのアップロード・変換処理
- 部材単位の紐づけ（member_id → 3D モデル対応）
- 複数モデルの切り替え UI
- Storage へのアプリ内アップロード UI（現在はダッシュボードから手動）

---

## 今後の予定（フェーズ3以降）

- アプリ内でのユーザー新規登録フォーム（現在は Supabase ダッシュボードから手動登録）
- BIM/IFC データ連携・AR/XR 連携
- inspections 入力・更新 UI の強化
- `/projects/[id]/viewer` へのビューア組み込み（プロジェクト別モデル管理）
- Supabase Storage からの GLB 読み込み対応
