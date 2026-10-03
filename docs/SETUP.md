# Initial GitHub setup

## 1. Create the repository

Recommended values:

| Setting | Recommended value |
|---|---|
| Repository name | `web-preview`, `pages-preview`, or `web-playground` |
| Description | Reusable GitHub Pages preview and test playground |
| Visibility | **Public** |
| Initialize with README | On is convenient because `main` is created immediately |
| `.gitignore` template | None |
| License | None |
| Default branch | `main` |

This template is intended for a project Pages URL such as:

```text
https://USERNAME.github.io/REPOSITORY/
```

## 2. Put the template files in the repository

A ZIP uploaded as a single file is not expanded by GitHub. Extract the ZIP first, then place the contents of the extracted `github-pages-preview-playground` directory at the repository root.

The repository root should look like this after upload:

```text
.github/
site/
tools/
docs/
AGENTS.md
PREVIEW_NOTES.md
README.md
preview.config.json
package.json
```

In particular, confirm that this file exists:

```text
.github/workflows/deploy-pages.yml
```

### Browser upload

1. Open the repository.
2. Select `Add file → Upload files`.
3. Drag the extracted contents into the upload area.
4. Confirm the directory structure is preserved.
5. Commit to `main`.

### Local Git upload

```bash
git clone https://github.com/USERNAME/REPOSITORY.git
cd REPOSITORY
cp -a /path/to/github-pages-preview-playground/. .
git add -A
git commit -m "Initialize reusable Pages preview playground"
git push origin main
```

## 3. Select GitHub Actions as the Pages source

Open:

```text
Settings → Pages → Build and deployment
```

Set:

```text
Source: GitHub Actions
```

Do not select `Deploy from a branch` for this template. The workflow intentionally publishes only the generated `.pages-dist/` artifact, keeping repository documentation and tooling out of the public site.

## 4. Confirm Actions are enabled

Open the repository `Actions` tab. The workflow name is:

```text
Deploy preview to GitHub Pages
```

It runs automatically whenever `main` changes and can also be run manually with `Run workflow`.

The workflow has two jobs:

1. `build` — prepares and uploads the Pages artifact.
2. `deploy` — deploys that artifact to the `github-pages` environment.

The `github-pages` environment is created automatically by GitHub during the first deployment.

## 5. Include this repository in the connected GitHub integration

When the GitHub integration is installed with access limited to selected repositories, add this preview repository to that selected set. The integration must be able to read and write repository contents for file creation, replacement, and deletion.

When asking an AI or connector to update the preview, specify the repository as `OWNER/REPOSITORY` and tell it to read `AGENTS.md` first.

## 6. Open the deployed page

After the workflow succeeds, open:

```text
Settings → Pages → Visit site
```

The reusable URL remains the same even when the contents of `site/` are completely replaced.

## 7. Recommended repository behavior for rapid previewing

For a disposable preview repository, the simplest operation is:

- Keep `main` as the deployment branch.
- Push preview changes directly to `main`.
- Leave the Pages source set to `GitHub Actions`.
- Keep the custom domain field empty unless a custom domain is intentionally introduced.
- Use the repository history when an older preview needs to be restored.

## 8. First-deployment verification

Confirm all of the following:

- The workflow completed successfully.
- `Settings → Pages` shows a published URL.
- The starter page loads.
- CSS and JavaScript load correctly.
- The page displays generated deployment metadata.

## Official references

- GitHub Pages custom workflows: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- Configuring a publishing source: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- Creating a Pages site: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
