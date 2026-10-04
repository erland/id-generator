# Browserkompatibilitet – id-generator

## Status

DEV-023 är verifierad så långt den aktuella körmiljön tillåter. Källkod, browserkrav och en riktig Chromium-motor har kontrollerats, men full appkörning i browser kunde inte genomföras eftersom körmiljön blockerar både lokal HTTP-navigation och `file://`-navigation i Chromium med `ERR_BLOCKED_BY_ADMINISTRATOR`.

Status: **passed_with_deferred**.

## Målbrowsermatris

| Plattform/browser | Status i denna miljö | Kvar till sluttest |
|---|---|---|
| Chromium desktop | Delvis verifierad med Chromium 144 | Byggd app, clipboard över HTTPS, service worker/offline, visuella viewporttester |
| Chrome Android | Deferred | Fullt mobilflöde, copy, PWA-installation, offline |
| Safari macOS | Deferred | Generering, hashing, copy, tema, installation/offline |
| Safari iPhone/iPad | Deferred | Touchflöde, copy, Add to Home Screen, standalone/offline |
| Firefox desktop | Deferred | Generering, copy, tema, filhashning, offline |

## Faktiskt verifierat i Chromium 144

Browsermotor: `Chromium 144.0.7559.96` på Debian 13.

En Playwright-driven Chromium-process startades framgångsrikt. Eftersom navigation blockeras av miljöpolicy användes en in-memory sida (`page.set_content`) för motor-/CSS-kontroller.

Verifierat som stödda i motorn:

- CSS Grid
- Flexbox
- `overflow-wrap: anywhere`
- `:focus-visible`
- `prefers-color-scheme`
- `crypto.getRandomValues()`
- `TextEncoder`
- `File.prototype.arrayBuffer()`
- `btoa()` / `atob()`

Secure-context-beroende API:er kunde inte verifieras korrekt från in-memory-sidan eftersom den inte är en secure context. Det gäller framför allt:

- `crypto.randomUUID()`
- `crypto.subtle`
- Async Clipboard API
- Service Worker API
- Cache Storage

Produktionsappen använder GitHub Pages över HTTPS, vilket är rätt distributionsmodell för dessa API:er.

## Browserberoenden och förväntade skillnader

### Clipboard

Appen använder `navigator.clipboard.writeText()` som förstahandsval och legacy-fallback för äldre/mer begränsade miljöer. Async Clipboard kräver secure context. Firefox och Safari kan dessutom kräva transient user activation för skrivning; appens copy-funktion startas direkt från ett användarklick.

Referens: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText

### UUID v4

`crypto.randomUUID()` används när det finns. Funktionen kräver secure context. Appen har en egen Web Crypto-baserad fallback med `crypto.getRandomValues()`, vilket minskar beroendet av `randomUUID()` på äldre browserkombinationer.

Referens: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID

### Service worker/offline

Service workers kräver secure context; HTTPS på GitHub Pages uppfyller det kravet. `http://localhost` behandlas normalt som secure context för utveckling, men lokal HTTP-navigation är blockerad av den aktuella körmiljön och kunde därför inte testas här.

Referens: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API

### PWA/standalone

Manifestet begär `display: standalone`, men manifest/display-beteende är plattforms- och browserberoende. Appen ska därför fungera korrekt även som vanlig webbsida om installation eller standalone-läge inte erbjuds av browsern.

Referens: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/display

## Sluttest som användaren ska köra

När npm-beroenden och en riktig browsermiljö finns tillgängliga ska följande köras:

1. `npm install`
2. `npm run lint`
3. `npm test`
4. `npm run build`
5. servera/deploya den byggda appen över HTTPS
6. testa minst Safari iPhone/iPad, Safari macOS, Chrome/Chromium desktop, Chrome Android där möjligt och Firefox desktop

För varje browser verifieras:

- generera UUID v4/v7, ULID, NanoID-liknande samt numeriska/alfanumeriska ID:n
- random bytes i Hex/Base64/Base64URL
- SHA-256/384/512 för text och lokal fil
- Copy och Copy all
- batch 1/5/10/100
- system/ljust/mörkt tema
- 375 px och desktoplayout utan horisontell overflow
- tangentbordsflöde där plattformen har tangentbord
- PWA-installation där browser/plattform erbjuder den
- offline efter första onlinebesök
- uppdatering efter ny deploy

## Releasebedömning

Ingen browseravvikelse som blockerar MVP har identifierats i källgranskningen. Full cross-browser-acceptans kan däremot inte ges förrän ovanstående browsermatris har körts på riktiga målplattformar. Detta är medvetet deferred enligt projektets teststrategi.
