# GitHub Pages Preview Playground

- リポジトリ: https://github.com/dekaazarashi1111-web/web-playground
- 公開URL: https://dekaazarashi1111-web.github.io/web-playground/
- 公開設定: Public / `main` / GitHub Actions / `github-pages` Environment
- 初期設定の記録: [`docs/INITIAL_SETUP.md`](docs/INITIAL_SETUP.md)

1つのPublicリポジトリを、HTML/CSS/JavaScript・モック・UI検証・静的ビルド成果物の共通プレビュー場所として使うためのテンプレートです。

この構成では、**公開する内容**と**リポジトリの管理・デプロイ設定**を分離しています。毎回ページ構成が大きく変わっても、通常は `site/` の中だけを全面的に置き換えれば公開できます。

## 基本設計

| 場所 | 役割 | 普段の扱い |
|---|---|---|
| `site/` | 現在公開する静的サイト | 自由に追加・変更・削除してよい |
| `preview.config.json` | 公開方法の設定 | 静的／ビルド方式を切り替えるときに変更 |
| `.github/workflows/deploy-pages.yml` | GitHub Pagesへの自動デプロイ | 通常は維持 |
| `tools/` | 成果物の作成・ローカル確認 | 通常は維持 |
| `PREVIEW_NOTES.md` | 現在のプレビューに関するメモ | 差し替え時に更新推奨 |
| `AGENTS.md` | AI・自動化ツール向け作業ルール | 通常は維持 |
| `docs/` | 初期設定・運用・設定リファレンス | 必要なときに参照 |

GitHub Pagesへ送られるのは、ワークフローが作成した `.pages-dist/` の中身だけです。README、メモ、AI向け指示、ツール類は公開サイトには混ざりません。

## 最初に行うこと

1. Publicリポジトリを作成します。名前は `web-preview`、`pages-preview`、`web-playground` などで構いません。
2. このZIPを展開し、**展開後のフォルダの中身**をリポジトリの `main` ブランチへ入れます。
3. GitHubで `Settings → Pages → Build and deployment → Source` を **GitHub Actions** にします。
4. `Actions` タブで `Deploy preview to GitHub Pages` の完了を確認します。
5. `Settings → Pages → Visit site` から公開ページを開きます。

詳しい手順は [`docs/SETUP.md`](docs/SETUP.md) にあります。

## 普段の最短運用

静的HTMLのプレビューなら、次の3点だけで足ります。

1. `site/` の古い内容を削除する。
2. 新しいHTML/CSS/JS/画像などを `site/` に配置する。
3. `site/index.html` が存在する状態で `main` に反映する。

`site/` 内の構成は自由です。

```text
site/
├── index.html
├── css/
│   └── main.css
├── js/
│   └── app.js
├── images/
└── demos/
    ├── demo-a/
    │   └── index.html
    └── demo-b/
        └── index.html
```

プロジェクトPagesのURLにはリポジトリ名が含まれるため、HTML内の参照は原則として次のような相対パスにします。

```html
<link rel="stylesheet" href="./css/main.css">
<script type="module" src="./js/app.js"></script>
<img src="./images/sample.png" alt="">
```

## 2つの公開モード

### `static` モード（初期状態）

`site/` をそのまま公開成果物へコピーします。素のHTML、CSS、JavaScript、画像、JSON、SVG、Webフォント、複数ページ構成などに向いています。

### `command` モード

任意のビルドコマンドを実行し、その出力ディレクトリを公開します。Vite、Astro、React、Vue、Svelte、各種静的サイトジェネレーターなどへ拡張できます。

設定方法は [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md) を参照してください。

## ローカル確認

Node.js 24以降で、外部パッケージを追加せずに確認できます。

```bash
npm run preview:build
npm run preview:serve
```

または直接実行できます。

```bash
node tools/build-preview.mjs
node tools/serve-preview.mjs
```

初期ポートは `4173` です。

```bash
PORT=8080 node tools/serve-preview.mjs
```

## AI・GitHub連携へ渡すときの依頼例

```text
OWNER/REPOSITORY の AGENTS.md と PREVIEW_NOTES.md を先に読んでください。
現在のプレビューを全面的に差し替えます。
site/ 内の古いファイルは残さず、新しい構成に合わせて追加・更新・削除してください。
静的HTMLとして動くようにし、入口は site/index.html、アセット参照は相対パスにしてください。
完了後に PREVIEW_NOTES.md も更新してください。
```

ビルドが必要なプロジェクトなら、次のように指定します。

```text
このプロジェクトはビルドが必要です。preview.config.json を command モードに変更し、
ビルドコマンドと公開出力先を設定してください。GitHub Pagesのベースパスは
PAGES_BASE_PATH 環境変数から扱ってください。
```

運用パターンと差し替え手順は [`docs/OPERATIONS.md`](docs/OPERATIONS.md) にまとめています。
