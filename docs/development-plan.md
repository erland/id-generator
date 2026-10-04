# id-generator – Implementationsplan

## Syfte

Denna plan bryter ned implementationen av `id-generator` i små, verifierbara steg. Varje steg ska kunna genomföras och verifieras innan nästa påbörjas.

Projektet är en statisk PWA som hostas på GitHub Pages och genererar identifierare, tokens och hashvärden lokalt i webbläsaren.

---

## Principer för genomförandet

- Ett steg i taget.
- Verifiera efter varje steg.
- Ingen backend.
- Ingen beständig lagring av genererade secrets.
- Använd `crypto.getRandomValues()` för kryptografisk slump.
- Minimera externa beroenden.
- Funktionalitet ska fungera både på mobil och desktop.
- GitHub Pages ska vara förstaklassmål från början.
- PWA/offline-stöd läggs in tidigt nog för att upptäcka problem med base path och caching.

---

# Fas 1 – Projektgrund

## Steg 1 – Skapa projektstruktur

Skapa ett nytt projekt med:

- React
- TypeScript
- Vite
- ESLint
- Vitest
- React Testing Library

Föreslagen struktur:

```text
src/
  app/
  components/
  generators/
  crypto/
  hashing/
  utils/
  types/
  styles/
```

### Verifiering

- `npm install` fungerar.
- `npm run build` fungerar.
- `npm test` fungerar.
- startsidan renderas lokalt.

---

## Steg 2 – Förbered GitHub Pages

Konfigurera Vite så att projektet fungerar när det hostas under repository-sökväg, exempelvis:

```text
https://<user>.github.io/id-generator/
```

Konfigurationen ska använda korrekt `base`.

Skapa GitHub Actions-workflow för build och deployment till GitHub Pages.

### Verifiering

- produktionbuild använder rätt asset paths.
- deployment-workflow kan köras utan specialsteg lokalt.
- inga absoluta `/assets/...`-referenser finns som bryter repository-hosting.

---

# Fas 2 – Gemensam generatorarkitektur

## Steg 3 – Definiera generatorgränssnitt

Skapa gemensamma typer för generatorer.

Exempel på koncept:

```ts
interface GeneratorDefinition {
  id: string;
  name: string;
  category: GeneratorCategory;
  description: string;
  generate(options: GeneratorOptions): GeneratedValue;
}
```

Definiera kategorier:

- Identifiers
- Secrets
- Hash
- Keys (framtida/experimentell)

### Verifiering

- TypeScript-kompilering fungerar.
- minst en testgenerator kan registreras och anropas genom gemensamt gränssnitt.

---

## Steg 4 – Kryptografisk slumpmodul

Skapa central modul för kryptografisk slump.

Funktioner bör minst omfatta:

- random bytes
- random integer med rejection sampling
- random characters från eget alfabet utan modulo-bias

Ingen generator får använda `Math.random()`.

### Verifiering

- enhetstester för intervall och längder.
- test som säkerställer att ogiltigt alfabet avvisas.
- kodsökning visar att `Math.random()` inte används.

---

# Fas 3 – Identifierare

## Steg 5 – UUID v4

Implementera UUID v4.

Preferera `crypto.randomUUID()` när tillgängligt, med kompatibel fallback baserad på `crypto.getRandomValues()` om det behövs.

### Verifiering

- format följer UUID v4.
- version nibble = 4.
- variantbitar är korrekta.

---

## Steg 6 – UUID v7

Implementera UUID v7 enligt aktuell standard.

### Verifiering

- format är UUID-kompatibelt.
- version nibble = 7.
- tidsdel kan verifieras mot skapandetid.
- två snabbt genererade värden är distinkta.

---

## Steg 7 – ULID

Implementera ULID.

Stöd:

- standard-ULID
- monoton generering om flera skapas inom samma millisekund, om implementationen hålls enkel och robust

### Verifiering

- längd 26 tecken.
- Crockford Base32.
- sorteringsordning över tid fungerar.

---

## Steg 8 – NanoID-liknande ID

Implementera korta URL-säkra ID:n.

Standard:

- 21 tecken
- URL-säkert alfabet

Tillåt valbar längd.

### Verifiering

- rätt längd.
- endast tillåtna tecken.
- ingen modulo-bias i teckenvalet.

---

## Steg 9 – Alfanumeriska och numeriska ID:n

Implementera:

- alfanumeriskt
- numeriskt
- valbar längd
- valbart prefix
- eget alfabet

### Verifiering

- prefix påverkar inte slumpdelen.
- längdval respekteras.
- tomt/ogiltigt alfabet hanteras tydligt.

---

# Fas 4 – Secrets och encoding

## Steg 10 – Random bytes

Implementera generering av valbart antal slumpbytes.

Presets:

- 16 bytes / 128 bit
- 24 bytes / 192 bit
- 32 bytes / 256 bit
- 48 bytes / 384 bit
- 64 bytes / 512 bit

### Verifiering

- exakt byteantal genereras.
- entropimärkning i UI stämmer.

---

## Steg 11 – Hex, Base64 och Base64URL

Implementera encoding av random bytes som:

- Hex
- Base64
- Base64URL utan padding

### Verifiering

- `48 bytes -> 64 Base64-tecken`.
- Base64URL innehåller inte `+`, `/` eller `=`.
- round-trip-test för encoding/decoding där relevant.

---

## Steg 12 – Secret/API token presets

Lägg till enkla presets för exempelvis:

```text
api_<random>
token_<random>
pk_<random>
```

Prefix ska vara valbart och tydligt separerat från entropidelen.

### Verifiering

- användaren kan ändra prefix.
- genererad random-del har definierad entropi oberoende av prefix.

---

# Fas 5 – Hashning

## Steg 13 – Text-hashning

Implementera med Web Crypto:

- SHA-256
- SHA-384
- SHA-512

Input:

- fritext

Output:

- Hex
- Base64

### Verifiering

- standardtestvektorer ger korrekta resultat.

---

## Steg 14 – Fil-hashning

Tillåt användaren att välja en lokal fil och beräkna hash utan uppladdning.

### Verifiering

- filen lämnar aldrig klienten.
- kända checksums verifieras korrekt.
- UI visar tydligt filnamn men sparar inte filen.

---

# Fas 6 – UI

## Steg 15 – Grundlayout för desktop och mobil

Desktop:

- vänster navigation eller tydlig kategori-lista
- generatorpanel

Mobil:

- kompakt kategori-/generatorväljare
- fullbreddsresultat
- stora touchmål

### Verifiering

Testa åtminstone:

- 375 px bredd
- 768 px bredd
- 1440 px bredd

Ingen horisontell scroll ska krävas för normal användning.

---

## Steg 16 – Generatorresultat

Resultatkomponenten ska stödja:

- monospace-visning
- lång text med wrap/scroll på kontrollerat sätt
- individuell Copy
- tydlig kopieringsfeedback

### Verifiering

- clipboard fungerar från HTTPS/localhost.
- fallback-fel visas begripligt om clipboard nekas.
- mobilanvändaren behöver inte markera text manuellt.

---

## Steg 17 – Batchgenerering

Stöd antal:

- 1
- 5
- 10
- 100

Och valfritt eget rimligt antal om vi bedömer det lämpligt.

Funktioner:

- Copy per rad
- Copy all

### Verifiering

- ordning och radbrytningar i Copy all är stabila.
- UI för 100 värden är fortfarande användbart på mobil.

---

## Steg 18 – Dark/light mode

Stöd:

- system preference
- manuell override

Endast preferensen får sparas lokalt, aldrig genererade values/secrets.

### Verifiering

- båda teman har god kontrast.
- valt tema överlever reload om användaren gjort override.

---

# Fas 7 – PWA

## Steg 19 – Manifest och installation

Lägg till:

- web app manifest
- namn: `id-generator`
- app icons
- standalone display
- theme/background metadata

### Verifiering

- installbar i kompatibel desktopbrowser.
- kan läggas på hemskärmen på mobil där webbläsaren stödjer det.

---

## Steg 20 – Offline/service worker

Implementera konservativ app-shell caching.

Genererade data ska aldrig cacheas separat.

Undvik aggressiv runtime-cache eftersom appen nästan helt består av statiska assets.

### Verifiering

- första besök kräver nätverk.
- därefter kan appen startas offline.
- ny deployment kan uppdatera gammal installation utan permanent stale-cache.

---

# Fas 8 – Säkerhet och integritet

## Steg 21 – Ingen historik

Verifiera att:

- genererade ID:n sparas inte.
- secrets sparas inte.
- hashinput sparas inte.
- privata nycklar, om de senare införs, aldrig sparas automatiskt.

### Verifiering

Inspektera:

- localStorage
- sessionStorage
- IndexedDB
- Cache Storage

Endast app-assets och explicita UI-preferenser får förekomma.

---

## Steg 22 – Security headers/begränsningar på GitHub Pages

Dokumentera vilka säkerhetsheaders som kan respektive inte kan styras via GitHub Pages.

Undvik beroende av serverkonfigurerad CSP om hostingmiljön inte medger det.

Minimera inline-script och externa resurser.

### Verifiering

- inga tredjepartsskript behövs för kärnfunktionalitet.
- inga analytics laddas.
- inga externa API-anrop sker vid generering.

---

# Fas 9 – SSH-spike

## Steg 23 – SPIKE-001: Ed25519/OpenSSH

Undersök separat:

1. aktuellt Web Crypto-stöd för Ed25519 i målwebbläsare.
2. exportformat från Web Crypto.
3. konvertering till OpenSSH public key format.
4. generering/export av `OPENSSH PRIVATE KEY`.
5. interoperabilitet med `ssh-keygen` och OpenSSH.
6. behov av externt bibliotek.
7. bundle-size och supply-chain-risk.

### Acceptanskriterium för spike

En testnyckel skapad i PWA:n ska kunna:

- läggas till i `authorized_keys`.
- autentisera mot en OpenSSH-server.
- läsas/verifieras av `ssh-keygen`.

Om detta inte kan göras enkelt och säkert ska SSH-funktionen skjutas till senare release.

---

# Fas 10 – Tillgänglighet och kvalitet

## Steg 24 – Accessibility-pass

Kontrollera:

- tangentbordsnavigation
- focus states
- labels
- aria där det behövs
- kontrast
- touch targets
- screen-reader-feedback för Copy

### Verifiering

- grundflöden fungerar utan mus.

---

## Steg 25 – Cross-browser-test

Minst:

- Safari på iPhone/iPad
- Safari på macOS
- Chrome/Chromium desktop
- Chrome Android där möjligt
- Firefox desktop

### Verifiering

Dokumentera avvikelser per browser.

---

# Fas 11 – Release

## Steg 26 – README och användardokumentation

README ska innehålla:

- vad appen gör
- lokal utveckling
- build
- test
- GitHub Pages deployment
- säkerhetsmodell
- integritetsmodell
- länk till live-sidan

---

## Steg 27 – CI

GitHub Actions ska minst köra:

```text
install
lint
test
build
```

Deployment till Pages får bara ske efter lyckad verifiering.

### Verifiering

- trasigt test blockerar deployment.
- fungerande main build deployas korrekt.

---

## Steg 28 – Första release

Första releasen bör innehålla:

### Must

- UUID v4
- UUID v7
- ULID
- NanoID-liknande ID
- numeriskt ID
- alfanumeriskt ID
- eget alfabet
- prefix
- random bytes
- Hex
- Base64
- Base64URL
- SHA-256
- SHA-384
- SHA-512
- text- och filhashning
- batchgenerering
- Copy / Copy all
- responsive UI
- dark/light mode
- offline PWA
- GitHub Pages deployment

### Ej blockerande för första release

- SSH Ed25519/RSA
- QR-koder
- Web Share
- sparad historik

---

# Rekommenderad ordning för faktisk utveckling

Arbetet bör genomföras i denna ordning:

```text
1  Projektstruktur
2  GitHub Pages CI/deploy
3  Generator API
4  Crypto random utilities
5  UUID v4
6  UUID v7
7  ULID
8  NanoID-liknande
9  Numeric/alphanumeric/custom alphabet
10 Random bytes + encoding
11 Secret presets
12 Hash text
13 Hash files
14 Responsive UI
15 Clipboard
16 Batch generation
17 Theme
18 PWA manifest
19 Offline/service worker
20 Security/integrity review
21 Accessibility
22 Cross-browser testing
23 SSH spike
24 Documentation
25 Release verification
```

Det är avsiktligt att GitHub Pages-konfigurationen görs mycket tidigt. Då upptäcks base-path- och asset-problem innan appen blivit stor.

---

# Definition of Done för MVP

MVP är klar när:

- samtliga Must-generatorer fungerar.
- all slump som kräver säkerhet kommer från Web Crypto.
- genererade secrets inte sparas.
- appen fungerar offline efter första laddningen.
- appen är installerbar som PWA där plattformen stödjer det.
- clipboard fungerar på mobil och desktop.
- appen är användbar vid 375 px och 1440 px bredd.
- test, lint och build passerar i CI.
- GitHub Pages deployment är reproducerbar.
- inga externa API-anrop behövs för kärnfunktionerna.
- README dokumenterar säkerhets- och integritetsmodellen.

