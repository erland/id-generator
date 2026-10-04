# ID Generator

`id-generator` är en statisk PWA för att generera identifierare, tokens och hashvärden lokalt i webbläsaren. Projektet är planerat för GitHub Pages och ska inte skicka genererade värden till någon backend.

## Utveckling

Krav: Node.js 22 och npm.

```bash
npm install
npm run dev
```

Verifiering:

```bash
npm run lint
npm test
npm run build
```

Projektet byggs stegvis enligt `docs/development-plan.md`.

## GitHub Pages

Projektet byggs för repository-sökvägen:

```text
https://<github-user>.github.io/id-generator/
```

Vite använder därför `base: '/id-generator/'`.

Deployment sker automatiskt från `main` via `.github/workflows/deploy-pages.yml`.

Första gången repositoryt konfigureras:

1. Öppna **Settings → Pages** i GitHub-repot.
2. Välj **GitHub Actions** som source/build and deployment source.
3. Pusha till `main` eller starta workflowet manuellt via **Actions**.

När `npm install` har kunnat köras och `package-lock.json` finns bör workflowets installationssteg bytas från `npm install` till `npm ci` för reproducerbara CI-byggen.
