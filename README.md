# steel-mr-inspection

鉄骨FAB向けの MR/AR 検査支援システムのモノレポです。
まずは Web 管理画面を先行して整備し、工事・部材・検査結果を管理する土台を作ります。後から iPad アプリや XR アプリが同じ API / DB を利用できるように、アプリ本体と共通パッケージを分けた構成にしています。

## 主なディレクトリ

- `apps/web`: 先行開発する Web 管理画面
- `apps/api`: Web / iPad / XR から利用する API
- `apps/ipad-ar`: 後から追加する iPad AR アプリ
- `apps/xr-app`: 後から追加する XR アプリ
- `packages/*`: 共通型、API クライアント、ドメイン知識、UI 仕様
- `converter`: 将来的な変換処理
- `docs`: 要件・API・DB・画面・構成メモ
- `assets`: IFC、GLB、画像、サンプル
- `scripts`: 補助スクリプト

## 現在の状態

Web アプリを着手しやすくするための初期骨組みを優先しており、実装コードは最小限です。
