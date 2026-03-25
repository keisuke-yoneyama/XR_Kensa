# public/models/

GLB サンプルファイルの置き場所です。

## 使い方

このディレクトリに `sample.glb` を配置すると、`/viewer` ページで 3D モデルを確認できます。

```
public/
  models/
    sample.glb   ← ここに置く
```

## サンプル GLB の入手先

無料のサンプル GLB ファイルは以下から入手できます。

- [Khronos Group glTF サンプル](https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0)
  - DamagedHelmet.glb / Box.glb など
- [Three.js examples](https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf)
  - Flamingo.glb / LittlestTokyo.glb など

いずれも右クリック → 「名前を付けてリンク先を保存」で `.glb` を保存し、
`public/models/sample.glb` としてリネームして配置してください。

## 注意

- このディレクトリ配下の `.glb` ファイルは `.gitignore` に追加を推奨します
  （大きなバイナリを git 管理しない）
- 将来は Supabase Storage に移行予定
