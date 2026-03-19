# src/lib/api

API ごとの関数を置く場所です。
共通の API 入口は `client.ts` に置き、`projects.ts`、`members.ts`、`inspections.ts` に機能単位の呼び出しをまとめます。
現在はダミーデータを返す初期状態で、後から apps/api 接続へ差し替える前提です。