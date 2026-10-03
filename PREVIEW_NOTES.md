# 現在のプレビュー

- **タイトル:** 初期プレビューページ
- **目的:** GitHub Pagesの自動公開と公開情報の表示を確認する。
- **公開URL:** https://dekaazarashi1111-web.github.io/web-playground/
- **モード:** `static`
- **公開元:** `site/`
- **入口:** `site/index.html`
- **主なルート:** `/web-playground/`
- **SPAフォールバック:** 無効
- **ビルド要件:** Node.js 24以降。外部npmパッケージ不要。
- **実装メモ:** 相対パスでアセットを参照し、`_preview/meta.json`からデプロイ情報を取得する。
- **最終の大きな差し替え:** 2026-10-03（ZIPから初期配置）

## 次回の差し替え

- `site/`の古いファイルを整理し、新しい内容を配置する。
- `site/index.html`を公開ルートの入口にする。
- 公開方式が変わる場合に`preview.config.json`を更新する。
- ビルド確認とこのメモの更新後、`main`へ反映する。
