# Arkitektur – id-generator

## 1. Syfte

Detta dokument beskriver målarkitekturen för `id-generator`, en helt klientbaserad PWA som hostas via GitHub Pages och används för att generera ID:n, tokens, kryptografiska slumpvärden, hashvärden och senare vissa kryptografiska nycklar.

Arkitekturen prioriterar:

- lokal bearbetning utan backend,
- låg komplexitet,
- hög säkerhet för secrets,
- full offlinefunktion efter första laddningen,
- responsivt gränssnitt för mobil och desktop,
- så få externa dependencies som möjligt,
- enkel deployment via GitHub Actions till GitHub Pages.

## 2. Arkitekturella beslut

### ADR-001 – Ren statisk PWA

**Beslut:** Applikationen byggs som en statisk PWA utan backend.

**Motivering:** Alla Must-funktioner kan genomföras lokalt i browsern. En backend skulle öka komplexitet, driftbehov och säkerhetsyta utan att tillföra värde för kärnfunktionerna.

**Konsekvenser:**

- inga server-side secrets,
- ingen databas,
- ingen autentisering,
- GitHub Pages kan användas direkt,
- användarens genererade värden lämnar inte enheten.

### ADR-002 – React + TypeScript + Vite

**Beslut:** Frontend byggs med React, TypeScript och Vite.

**Motivering:** Stacken är väl lämpad för liten PWA, ger stark typning och enkel statisk build samt passar bra med testning och GitHub Pages.

### ADR-003 – Web Crypto först

**Beslut:** Kryptografiska funktioner ska i första hand använda browserns inbyggda Web Crypto API och `crypto.getRandomValues()`.

**Motivering:** Detta minskar behovet av egen kryptografi och tredjepartsbibliotek.

**Regel:** `Math.random()` får inte användas för generatorer vars output kan tolkas som token, secret, key material eller säkerhetsrelaterat ID.

### ADR-004 – Ingen beständig lagring av genererade värden

**Beslut:** Resultat hålls endast i applikationens minne.

**Konsekvens:** Refresh eller stängning av appen rensar genererade ID:n, tokens och nycklar.

### ADR-005 – Repository-aware base path

**Beslut:** Build och PWA-konfiguration ska uttryckligen stödja GitHub Pages under `/id-generator/`.

**Konsekvens:** Asset paths, manifest, service worker scope och routing får inte anta root `/`.

### ADR-006 – Ingen client-side router i första versionen

**Beslut:** MVP:n använder intern state-baserad navigation i en enda sida i stället för URL-baserad router.

**Motivering:** Det undviker onödig complexity och reducerar problem med GitHub Pages deep links och base paths.

### ADR-007 – Generatorer isoleras från UI

**Beslut:** Varje generator implementeras som en ren modul med tydligt kontrakt och utan React-beroenden.

**Motivering:** Det gör generatorerna testbara, återanvändbara och enklare att säkerhetsgranska.

## 3. Systemkontext

```text
                    ┌────────────────────────────┐
                    │ GitHub Repository          │
                    │ id-generator               │
                    └─────────────┬──────────────┘
                                  │
                                  │ GitHub Actions
                                  ▼
                    ┌────────────────────────────┐
                    │ GitHub Pages               │
                    │ statiska HTML/JS/CSS-filer │
                    └─────────────┬──────────────┘
                                  │ HTTPS
                                  ▼
┌────────────────────────────────────────────────────────┐
│ Användarens browser / installerad PWA                  │
│                                                        │
│  UI  →  Generator service  →  Web Crypto              │
│   │             │                                      │
│   │             ├→ UUID / ULID / NanoID-like          │
│   │             ├→ Random bytes / encoding            │
│   │             └→ Hash                               │
│   │                                                    │
│   ├→ Clipboard API                                     │
│   ├→ PWA / Service Worker                              │
│   └→ Theme / responsive presentation                  │
│                                                        │
│ Inga genererade värden skickas till nätverket          │
└────────────────────────────────────────────────────────┘
```

## 4. Logiska komponenter

### 4.1 App Shell

Ansvar:

- övergripande layout,
- navigation mellan generatorgrupper,
- tema,
- responsiv presentation,
- PWA update-status,
- gemensam feedback som `Copied`.

Får inte innehålla generatorlogik.

### 4.2 Generator Registry

Ett centralt register beskriver vilka generatorer som finns och hur UI ska presentera dem.

Exempelmodell:

```ts
interface GeneratorDefinition {
  id: string;
  name: string;
  category: "identifier" | "secret" | "hash" | "key";
  description: string;
  sensitive: boolean;
  supportsBatch: boolean;
}
```

Syftet är att kunna lägga till framtida generatorer utan att bygga om navigationen.

### 4.3 Generator Core

Generator Core innehåller rena funktioner för:

- UUID v4,
- UUID v7,
- ULID,
- NanoID-liknande ID,
- alfanumeriska ID:n,
- numeriska ID:n,
- random bytes,
- Hex/Base64/Base64URL,
- senare HMAC-secrets.

Gemensamt kontrakt:

```ts
interface Generator<TOptions> {
  generate(options: TOptions): string;
}
```

Asynkrona generatorer, exempelvis Web Crypto-baserade nycklar, får separat async-kontrakt.

### 4.4 Secure Random Service

All kryptografisk slump centraliseras här.

Ansvar:

- använda `crypto.getRandomValues()`,
- generera random bytes,
- rejection sampling för egna alfabet,
- garantera att ingen modulo-bias introduceras,
- tillhandahålla gemensamma utilities för andra generatorer.

Ingen generator får implementera egen osäker slumpmekanism.

### 4.5 Encoding Service

Ansvar:

- Hex,
- Base64,
- Base64URL,
- byte/string-konverteringar,
- säker hantering av UTF-8 där det behövs.

### 4.6 Hash Service

Ansvar:

- SHA-256,
- SHA-384,
- SHA-512,
- text → bytes via `TextEncoder`,
- `crypto.subtle.digest()`.

Filhashning läggs till senare bakom samma service.

### 4.7 Clipboard Service

Ansvar:

- `navigator.clipboard.writeText()`,
- felhantering,
- browser-fallback eller tydlig instruktion vid nekad clipboardåtkomst,
- ingen loggning av kopierat innehåll.

### 4.8 Key Service

Ingår inte i Must-MVP men reserveras arkitekturellt.

Ansvar senare:

- Ed25519 key generation,
- eventuell RSA,
- exportformat,
- OpenSSH-serialisering,
- explicit `clear()` för privat nyckel från UI-state.

Implementation av denna komponent blockeras av SPIKE-001.

### 4.9 PWA Service

Ansvar:

- installation metadata,
- offline app shell,
- cacheversionering,
- update-detektering,
- skydd mot stale deployment.

Runtime-cache ska inte användas för genererade användardata.

## 5. Föreslagen kodstruktur

```text
id-generator/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy-pages.yml
├── public/
│   ├── icons/
│   └── manifest.webmanifest
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── navigation.ts
│   │   └── theme.ts
│   ├── components/
│   │   ├── GeneratorPanel.tsx
│   │   ├── ResultList.tsx
│   │   ├── CopyButton.tsx
│   │   └── BatchControls.tsx
│   ├── generators/
│   │   ├── registry.ts
│   │   ├── uuid-v4.ts
│   │   ├── uuid-v7.ts
│   │   ├── ulid.ts
│   │   ├── nanoid-like.ts
│   │   ├── alphanumeric.ts
│   │   ├── numeric.ts
│   │   └── random-bytes.ts
│   ├── services/
│   │   ├── secure-random.ts
│   │   ├── encoding.ts
│   │   ├── hashing.ts
│   │   ├── clipboard.ts
│   │   └── keys.ts
│   ├── models/
│   │   ├── generator.ts
│   │   └── result.ts
│   ├── styles/
│   ├── main.tsx
│   └── vite-env.d.ts
├── tests/
│   ├── generators/
│   ├── services/
│   └── integration/
├── docs/
│   ├── functional-specification.md
│   ├── risk-feasibility.md
│   └── architecture.md
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 6. Data- och state-modell

Applikationen behöver ingen persistent domänmodell.

UI-state kan hållas i React-state:

```ts
interface GeneratorState {
  generatorId: string;
  options: Record<string, unknown>;
  results: GeneratedResult[];
}

interface GeneratedResult {
  id: string;
  value: string;
  sensitive: boolean;
  createdAt: number;
}
```

`createdAt` används endast i runtime och lagras inte persistent.

### Förbjuden lagring i MVP

Följande ska inte innehålla genererade values:

- localStorage,
- sessionStorage,
- IndexedDB,
- URL query parameters,
- URL fragments,
- service worker cache,
- console logs,
- analytics/events.

## 7. Säkerhetsarkitektur

### 7.1 Säker slump

Alla säkerhetsrelevanta generatorer går via `SecureRandomService`.

För alfabet med valfri längd används rejection sampling i stället för modulo:

```text
random byte
   ↓
är värdet ligger inom största jämnt delbara intervallet
   ↓
map till alfabet
annars kasta och dra nytt byte
```

Detta eliminerar modulo-bias.

### 7.2 Secrets i UI

Secrets och privata nycklar ska markeras med `sensitive: true`.

UI kan senare använda detta för:

- varningsmarkering,
- explicit reveal/hide,
- tydlig `Rensa`-knapp,
- blockera QR-funktion,
- undvika Web Share som standard.

### 7.3 Content Security Policy

Eftersom GitHub Pages inte erbjuder egna responsheaders per route bör CSP sättas via `<meta http-equiv="Content-Security-Policy">` där praktiskt möjligt.

Målbild:

- inga externa scripts,
- inga inline scripts om det går att undvika,
- inga runtime-CDN-dependencies,
- begränsa `connect-src` så långt appens funktioner tillåter.

### 7.4 Dependency strategy

Prioritet:

1. browser-native API,
2. liten intern implementation för enkla standardformat,
3. litet etablerat bibliotek när korrekt standardimplementation annars blir onödigt riskfylld,
4. undvik stora utility-bibliotek.

Varje dependency för kryptografiskt eller identifieringsrelaterat beteende ska kunna motiveras och testas.

## 8. PWA-arkitektur

Rekommendation: använd en etablerad Vite PWA-plugin för manifest och precache av app shell.

Service worker ska cache:a:

- HTML,
- JS,
- CSS,
- ikoner,
- manifest,
- statiska fonts endast om de paketeras lokalt.

Service worker ska inte cache:a:

- clipboarddata,
- genererade ID:n,
- secrets,
- privata nycklar,
- användarens hash-input.

### Update-strategi

När ny version upptäcks visas diskret feedback, exempelvis:

```text
Ny version finns tillgänglig  [Uppdatera]
```

Användaren ska kunna fortsätta på aktuell version tills uppdatering väljs, så att ett genererat värde inte försvinner oväntat mitt i användningen.

## 9. GitHub Pages deployment

Föreslagen pipeline:

```text
push / pull request
      ↓
GitHub Actions CI
  - install
  - lint
  - typecheck
  - unit tests
  - build
      ↓
merge till main
      ↓
GitHub Actions Pages deploy
      ↓
https://<owner>.github.io/id-generator/
```

Vite ska använda repository-aware base:

```ts
base: "/id-generator/"
```

Om custom domain införs senare bör base göras konfigurerbar snarare än hårdkodad.

## 10. Testarkitektur

### Unit tests

Kritiska unit tests:

- UUID v4 format och version/variant bits,
- UUID v7 format och tidsfält,
- ULID längd/alfabet/sorteringsbeteende,
- Base64URL utan `+`, `/`, `=`,
- exakt byte-/bitlängd för secrets,
- custom alphabet utan modulo-bias implementation,
- hash mot kända testvektorer,
- prefix/suffix påverkar inte beräknad entropi.

### Integration tests

- generate → render → copy,
- batch generate → copy all,
- byta generator utan att gammalt secret läcker till ny vy,
- theme switching,
- offline app shell.

### Browser/E2E

Minst:

- Chromium desktop,
- Safari/WebKit,
- mobil viewport,
- GitHub Pages deploy smoke test.

För särskilt clipboard och PWA är faktisk browserverifiering viktigare än enbart jsdom-tester.

## 11. UI-arkitektur

### Desktop

Tvåkolumnslayout:

```text
┌───────────────────────────────────────────────┐
│ id-generator                                 │
├───────────────┬───────────────────────────────┤
│ Generatorer   │ Aktiv generator              │
│               │ Inställningar                │
│ Identifiers   │ Resultat                     │
│ Secrets       │ Copy / Copy all              │
│ Hash          │ Generate                     │
│ Keys*         │                               │
└───────────────┴───────────────────────────────┘
```

### Mobil

En kolumn med generatorväljare överst:

```text
id-generator

[ UUID v7        ▾ ]

Inställningar

[ Generera ]

Resultat
xxxxxxxxxxxxxx   [Kopiera]
```

Touch targets ska vara tillräckligt stora och Copy ska alltid vara direkt åtkomlig.

## 12. Tillgänglighet

MVP ska minst stödja:

- semantiska labels,
- tangentbordsnavigation,
- tydlig focus state,
- `aria-live` för copy-feedback,
- tillräcklig kontrast i light/dark,
- ingen funktion får vara beroende enbart av färg,
- responsivt textflöde för långa ID:n.

## 13. Prestanda

Målet är liten bundle och snabb start även på mobil.

Riktlinjer:

- undvik tung komponentplattform,
- undvik runtime-CDN,
- lazy-load endast framtida stora funktioner som SSH om det faktiskt minskar initial bundle,
- batchlimit i UI,
- ingen Web Worker i MVP för normala ID:n.

## 14. Avgränsningar i arkitekturen

Inte i första implementationen:

- backend,
- konto/inloggning,
- sync mellan enheter,
- cloud history,
- telemetry,
- URL-router,
- SSH innan SPIKE-001 är klar,
- QR för secrets,
- persistent secret storage.

## 15. Beslut inför implementation

Projektet kan implementeras i följande ordning:

1. repository-skelett + Vite/React/TypeScript,
2. CI + GitHub Pages build/deploy,
3. PWA shell och base-path-verifiering,
4. `SecureRandomService` + encoding,
5. UUID v4/v7, ULID och NanoID-like,
6. random text/numeric/bytes,
7. batch + clipboard,
8. hash,
9. offline/update-flöde,
10. responsiv polish + accessibility,
11. SPIKE-001 för SSH,
12. eventuell SSH-implementation som separat efterföljande steg.

## 16. Arkitekturell status

**Status:** Ready for implementation planning.

Det finns inga blockerande arkitekturrisker för Must-scope. SSH-funktionalitet förblir explicit separerad tills interoperabilitet med OpenSSH har verifierats.
