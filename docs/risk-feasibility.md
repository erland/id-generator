# Risk- och genomförbarhetsanalys – id-generator

## 1. Sammanfattning

`id-generator` bedöms vara **tekniskt genomförbar som en helt statisk PWA på GitHub Pages**.

Must-scope kan genomföras utan backend och utan att genererade värden lämnar användarens webbläsare. Web Crypto API, Clipboard API och Service Worker/PWA-stöd täcker de centrala behoven när appen körs över HTTPS.

Ingen identifierad risk blockerar implementation av Must-scope.

Den enda del som bör verifieras separat innan den tas in i arkitekturen som produktionskrav är **SSH-nyckelgenerering i OpenSSH-kompatibelt format**, särskilt Ed25519 private key-format. Själva kryptografiska nyckelgenereringen stöds av Web Crypto i moderna webbläsare, men OpenSSH-serialisering och interoperabilitet behöver bevisas med en avgränsad spike.

## 2. Feasibility-beslut

| Område | Bedömning | Beslut |
|---|---|---|
| Statisk PWA | Genomförbar | Acceptera |
| GitHub Pages | Genomförbar | Acceptera |
| UUID/ULID/NanoID-liknande ID | Genomförbar | Acceptera |
| Kryptografiska slumpvärden | Genomförbar | Acceptera |
| SHA-256/384/512 | Genomförbar | Acceptera |
| Clipboard | Genomförbar med fallback/felhantering | Acceptera |
| Offline | Genomförbar med service worker | Acceptera |
| SSH Ed25519 | Troligen genomförbar, format/interoperabilitet ej verifierad | Spike före implementation |
| SSH RSA | Genomförbar men sekundär | Defer tills behov verifierats |
| Backend | Ej nödvändig | Undvik |
| Persistent lagring av secrets | Ej nödvändig | Undvik |

## 3. Viktiga tekniska antaganden

### A-001 – HTTPS finns i driftmiljön

GitHub Pages stöder HTTPS och kan enforce:a HTTPS. Detta är viktigt eftersom Web Crypto, Clipboard API och Service Workers förutsätter secure context i normala webbläsarmiljöer.

**Bedömning:** verifierat och låg risk.

### A-002 – Kärnfunktionerna kan köras lokalt

UUID, slumpvärden, hashning och övrig ID-generering kräver ingen serverfunktion. Kryptografisk slump ska bygga på `crypto.getRandomValues()` och hash/nyckeloperationer på Web Crypto där det är lämpligt.

**Bedömning:** verifierat och låg risk.

### A-003 – PWA:n kan hostas under repository-path

GitHub Pages kan publicera projektet på en URL av typen `https://<user>.github.io/id-generator/`. Manifest, asset-paths, router och service worker måste därför fungera med ett icke-root base path.

**Bedömning:** genomförbart men ska hanteras explicit i build-konfigurationen.

## 4. Riskregister

### RISK-001 – OpenSSH-format för Ed25519

- **Kategori:** Technical feasibility / Security
- **Risk:** Web Crypto kan generera Ed25519-nycklar, men appen behöver kunna exportera dem i format som vanliga OpenSSH-verktyg faktiskt accepterar.
- **Probability:** medium
- **Impact:** medium
- **Nivå:** medium
- **Trigger/evidence:** en genererad private/public key kan inte läsas av `ssh-keygen`, OpenSSH eller motsvarande verifieringsverktyg.
- **Hantering:** mitigate genom separat spike före implementation av FR-040/FR-041.
- **Status:** open
- **Kopplade krav:** FR-040, FR-041, FR-042.

**Beslut:** SSH ligger kvar i Should-scope tills spike har passerat.

### RISK-002 – Privat nyckel exponeras i webbläsarens minne/UI

- **Kategori:** Security
- **Risk:** En privat SSH-nyckel måste åtminstone kortvarigt finnas i applikationens minne och eventuellt visas/exporteras. XSS eller oavsiktlig lagring skulle då kunna exponera nyckeln.
- **Probability:** low
- **Impact:** high
- **Nivå:** medium
- **Hantering:** ingen extern scriptinladdning för kärnfunktioner, strikt CSP där GitHub Pages tillåter det via meta-policy, inga analytics, ingen persistent resultathistorik, minimera tiden privat nyckel hålls i UI, tydlig rensa-funktion och dependency-granskning.
- **Status:** open
- **Kopplade krav:** FR-042, BR-004.

### RISK-003 – Bias i egen alfabetgenerator

- **Kategori:** Security / Technical
- **Risk:** En naiv implementation såsom `randomByte % alphabet.length` ger modulo-bias när alfabetets storlek inte delar 256 jämnt. Det kan minska den faktiska entropin för secrets och NanoID-liknande värden.
- **Probability:** high om naiv implementation används
- **Impact:** medium
- **Nivå:** high
- **Hantering:** använd rejection sampling eller välgranskad implementation. Entropiberäkning ska baseras på faktisk alphabet-size och slumpmässig längd.
- **Status:** open
- **Kopplade krav:** FR-004, FR-005, FR-011, BR-002, BR-003.

### RISK-004 – Clipboard nekas av webbläsaren

- **Kategori:** Technical / UX
- **Risk:** `navigator.clipboard.writeText()` kräver secure context och kan nekas beroende på browser-/permission-/user-gesture-regler.
- **Probability:** low/medium
- **Impact:** low
- **Nivå:** low
- **Hantering:** anropa copy från explicit användarinteraktion, hantera `NotAllowedError`, ge tydlig feedback och erbjud manuell markering/kopiering när API:t misslyckas.
- **Status:** open
- **Kopplade krav:** FR-021, FR-022, FR-023.

### RISK-005 – Service worker visar gammal version efter deployment

- **Kategori:** Operations / deployment
- **Risk:** Aggressiv cache kan göra att användaren fortsätter köra en gammal version efter att GitHub Pages uppdaterats.
- **Probability:** medium
- **Impact:** low/medium
- **Nivå:** medium
- **Hantering:** versionsstyrd asset-cache via buildverktygets PWA-plugin, försiktig cache-strategi för app shell, update-detektering och enkel användarfeedback när ny version finns.
- **Status:** open
- **Kopplade krav:** FR-050, FR-051.

### RISK-006 – Felaktiga base paths på GitHub Pages

- **Kategori:** Deployment
- **Risk:** Manifest, ikoner, JS/CSS eller service worker kan få 404 om appen antar `/` som root när den publiceras under `/id-generator/`.
- **Probability:** medium
- **Impact:** medium
- **Nivå:** medium
- **Hantering:** sätt explicit build-base för GitHub Pages, använd relativ/konfigurerad manifest-scope, och verifiera den byggda artefakten på faktisk Pages-URL i CI/acceptanstest.
- **Status:** open
- **Kopplade krav:** FR-050, FR-051.

### RISK-007 – Batchstorlek påverkar UI

- **Kategori:** Performance / UX
- **Risk:** Mycket stora batcher kan frysa UI, skapa stora clipboard-operationer eller ge onödigt minnestryck.
- **Probability:** medium
- **Impact:** low
- **Nivå:** low/medium
- **Hantering:** validerat maxantal i första versionen, exempelvis 1–1000 beroende på generatortyp. Börja konservativt och utöka först vid behov.
- **Status:** open
- **Kopplade krav:** FR-020, FR-022.

### RISK-008 – Externa dependencies skapar supply-chain-risk

- **Kategori:** Security / Legal
- **Risk:** Bibliotek för UUID v7, ULID, NanoID eller SSH-format kan introducera sårbarheter, licensproblem eller onödigt stor bundle.
- **Probability:** medium
- **Impact:** medium
- **Nivå:** medium
- **Hantering:** minimera dependencies, använd browser-native API när möjligt, välj små etablerade bibliotek endast där nyttan är tydlig, lås versioner och kör dependency scanning i CI.
- **Status:** open

## 5. Säkerhetsbedömning

### Trust boundary

Appen bör ha en mycket enkel trust boundary:

```text
Användarens enhet
┌──────────────────────────────────────┐
│ id-generator PWA                     │
│                                      │
│ UI                                   │
│ Generatorer                          │
│ Web Crypto                           │
│ Clipboard                            │
│ Service Worker                       │
└──────────────────────────────────────┘
          ↑
          │ statiska filer
          │
     GitHub Pages
```

Genererade värden ska inte skickas tillbaka till GitHub Pages eller någon annan server.

### Säkerhetsprinciper

- Ingen backend.
- Ingen telemetry/analytics i första versionen.
- Ingen persistent historik.
- Inga secrets i URL/query/hash.
- Inga secrets i loggar.
- Inga secrets i service worker-cache.
- Kryptografisk slump via browserns CSPRNG.
- Hashning lokalt.
- Så få tredjepartsdependencies som möjligt.
- Resultat som klassas som secrets märks tydligt.
- Privat nyckel ska kunna rensas från UI med ett handgrepp.

## 6. Deployment- och PWA-bedömning

GitHub Pages passar väl eftersom applikationen är statisk och publik och saknar serverside-secrets.

Rekommenderad deploymentprofil:

`github-pages-static-pwa`

Förväntad kedja:

```text
GitHub repository
      ↓
GitHub Actions
  lint / test / build
      ↓
Pages artifact
      ↓
GitHub Pages (HTTPS)
```

Builden bör göra all dependency-bundling i förväg. PWA:n ska inte vara beroende av CDN-skript vid runtime, eftersom det både försämrar offline-funktion och ökar supply-chain-ytan.

## 7. Prestanda och skalning

Projektet har ingen serverside-skalningsrisk. Belastningen ligger helt på klienten.

För Must-scope förväntas generering av enstaka eller normala batcher vara försumbar. Filhashning i Should-scope kan däremot behöva separat hantering för mycket stora filer och bör implementeras så att UI inte låses onödigt.

Första versionen behöver ingen Web Worker för normal ID-generering. Web Worker kan introduceras senare för tung filhashning om mätning visar behov.

## 8. Rekommenderad spike

### SPIKE-001 – Verifiera Ed25519 → OpenSSH

**Fråga**  
Kan en statisk webbläsarapplikation generera ett Ed25519-nyckelpar lokalt och exportera public/private key i format som OpenSSH accepterar, utan server och utan osäker egen kryptografi?

**Scope**

- Generera Ed25519 med Web Crypto där browsern stöder det.
- Exportera rå/public och private key-material i tillgängligt standardformat.
- Konvertera/serialisera till OpenSSH-kompatibla format med minsta säkra lösning.
- Ingen produktions-UI.
- Ingen RSA i denna spike.

**Evidence**

- Genererad publik nyckel accepteras av `ssh-keygen`/OpenSSH.
- Genererad privat nyckel kan läsas av `ssh-keygen`/OpenSSH.
- Signering/verifiering eller motsvarande interoperabilitetstest passerar.
- Test i minst Chromium och Safari/WebKit på aktuella versioner.
- Dependency/licens dokumenterad om bibliotek krävs.

**Exit criteria**

Ett av följande beslut dokumenteras:

1. **ACCEPT:** Web Crypto + liten verifierad serializer/library används.
2. **CHANGE:** annan säker klientbaserad implementation väljs.
3. **DEFER:** SSH flyttas från Should till framtida scope.

Arkitekturen ska därefter uppdateras med beslutet.

## 9. Riskreducerande verifiering inför implementation

Följande bör ingå tidigt i utvecklingsplanen:

1. verifiera GitHub Pages base path och PWA-installation på faktisk Pages-deployment,
2. testa offline efter första laddningen,
3. verifiera clipboard på Safari/iOS och Chromium-baserad desktop,
4. statistiskt/enhetstesta egen alfabetgenerator för att undvika modulo-bias,
5. verifiera UUID v7-format mot standardkompatibla testvektorer eller etablerad implementation,
6. kontrollera att genererade secrets inte hamnar i localStorage, IndexedDB, URL, logs eller service worker-cache,
7. genomför SPIKE-001 innan SSH-funktionalitet planeras som produktionssteg.

## 10. Slutsats

Projektet kan gå vidare till arkitektur.

**Must-scope är genomförbar utan blockerande risker.** GitHub Pages är en lämplig deploymentmiljö och passar den säkerhetsmodell där all generering sker lokalt.

SSH-stödet ska inte blockera MVP:n. Det ska hållas separat och styras av resultatet från `SPIKE-001`.

### Rekommenderat nästa steg

Skapa `docs/architecture.md` med minsta arkitektur som stöder Must-scope och med följande redan fattade beslut:

- statisk PWA,
- GitHub Pages,
- HTTPS,
- ingen backend,
- ingen användarautentisering,
- ingen automatisk persistent lagring av genererade värden,
- browser-native Web Crypto/Clipboard när möjligt,
- minimerade externa dependencies,
- SSH isoleras bakom separat capability och implementeras först efter SPIKE-001.
