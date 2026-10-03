# 初期設定の記録

- 作業日: 2026-10-03（日本時間）
- リポジトリ: https://github.com/dekaazarashi1111-web/web-playground
- 公開URL: https://dekaazarashi1111-web.github.io/web-playground/
- 可視性: Public
- 既定ブランチ: `main`
- Pages公開元: GitHub Actions（`build_type: workflow`）
- カスタムドメイン: なし
- HTTPS強制: 有効
- GitHub Actions: 有効
- Environment: `github-pages`（待機時間・承認者なし。Pagesが自動設定した`main`からのデプロイを許可）
- ブランチ保護・Ruleset: なし
- Secrets: 追加なし
- 公開成果物: `.pages-dist/`のみ。生成物はGit管理対象外。

## 入力と配置

- 入力ZIP: `github-pages-preview-playground.zip`
- SHA-256: `b00003768beeec11e5edb0af39e8a08f2705ea713c554dc796e90d32ddb1a449`
- ZIPのチェックサムを添付説明と照合し、内部フォルダの中身をリポジトリルートへ配置した。
- テンプレートの公開ツールとワークフローを保持し、READMEに実際のURLを追記、PREVIEW_NOTESを初期配置の内容へ更新した。

## 検証

- Node.js `v24.19.0`による`tools/build-preview.mjs`、`tools/serve-preview.mjs`、`site/assets/app.js`の構文確認: PASS
- `node tools/build-preview.mjs`: PASS（7ファイルを生成）
- JSONの読み取り、HTMLの相対アセット・リンク先の存在確認: PASS
- 公開ルートの`index.html`・`.nojekyll`の存在と、管理ファイルが公開成果物に含まれないこと: PASS
- Pagesの`workflow`設定、HTTPS強制、Environment設定: GitHub APIで確認済み。
- デプロイ履歴: https://github.com/dekaazarashi1111-web/web-playground/actions/workflows/deploy-pages.yml
- 公開中のコミット: https://dekaazarashi1111-web.github.io/web-playground/_preview/meta.json

## 初回公開の確認

- 初回コミット: `b345aa09a038c56cc3b6b34ee8dc12a13c8a2b00`
- Actions実行: https://github.com/dekaazarashi1111-web/web-playground/actions/runs/37088864417 （`completed / success`）
- 公開HTML、CSS、JavaScript、favicon、`_preview/meta.json`: HTTP 200を確認。
- メタデータのコミットと`/web-playground`ベースパスが一致した。
- ブラウザ上でページと公開情報（Repository / Mode / Base path / Commit / Files / Built）の表示を確認した。
- GitHub連携から新規リポジトリへの読み取り・書き込み権限が見えることを確認した。

## ネットワーク利用と確認資料

- GitHub APIでテンプレート指定の公式Actionタグが存在することを確認した: `actions/checkout@v7`、`actions/setup-node@v7`、`actions/configure-pages@v6`、`actions/upload-pages-artifact@v5`、`actions/deploy-pages@v5`。
- GitHub Pagesのカスタムワークフロー要件: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- Pages REST APIの`build_type: workflow`設定: https://docs.github.com/en/rest/pages/pages

## 日常の更新

`site/`を差し替え、必要に応じて`preview.config.json`を更新する。ビルド確認と`PREVIEW_NOTES.md`更新後に`main`へpushすると自動公開される。
