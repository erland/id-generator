# Funktionell specifikation – id-generator

## 1. Syfte och mål

`id-generator` ska vara en enkel, snabb och integritetsvänlig PWA för att generera identifierare, tokens, slumpvärden, checksummor/hashar och vissa kryptografiska nycklar direkt i användarens webbläsare.

Målet är att användaren utan installation av utvecklingsverktyg ska kunna skapa ett eller flera värden, förstå vilken typ av värde som genereras och enkelt kopiera resultatet till clipboard. Applikationen ska fungera väl på både mobil och desktop och kunna användas offline efter första laddningen.

Första releasen ska kunna distribueras som en statisk webbapplikation via GitHub Pages och får därför inte kräva en backend för kärnfunktionerna.

### Success criteria

- De vanligaste ID- och tokenformaten kan genereras lokalt i webbläsaren.
- Ett genererat värde kan kopieras med ett tydligt handgrepp på både touch- och desktop-enheter.
- Appen fungerar som installerbar PWA och kan användas offline efter att den laddats minst en gång.
- Ingen genererad hemlighet behöver skickas till någon extern tjänst för att appen ska fungera.
- Gränssnittet är användbart från mobiltelefon till desktop utan separat mobilversion.

## 2. Scope

### Must – första release

- UUID v4.
- UUID v7.
- ULID.
- NanoID-liknande URL-vänligt ID.
- Slumpmässigt alfanumeriskt ID med valbar längd.
- Slumpmässigt numeriskt ID med valbar längd.
- Kryptografiskt slumpvärde som Hex.
- Kryptografiskt slumpvärde som Base64.
- Kryptografiskt slumpvärde som Base64URL.
- Färdiga säkerhetsnivåer/presets för slumpvärden, inklusive minst 128, 192, 256, 384 och 512 bitar.
- Batchgenerering av flera värden av samma typ.
- Kopiering av ett enskilt resultat.
- Kopiering av alla resultat i en batch.
- SHA-256, SHA-384 och SHA-512 för text.
- Responsivt gränssnitt för mobil, tablet och desktop.
- Installerbar PWA.
- Offlineanvändning efter första laddningen.
- Light/dark mode med respekt för operativsystemets standardinställning.
- Ingen automatisk historik över genererade värden.

### Should

- Eget prefix och/eller suffix för lämpliga ID-/tokenformat, exempelvis `token_...` eller `pk_live_...`.
- Eget alfabet för slumpmässiga text-ID:n.
- Hashning av lokal fil utan uppladdning.
- SSH-nyckelpar där detta kan göras säkert och interoperabelt i webbläsaren, i första hand Ed25519 och vid behov RSA.
- Generering av HMAC-hemlighet.
- Export/nedladdning av kryptografiska nycklar i lämpliga standardformat.
- Web Share för icke-känsliga genererade värden på plattformar som stöder det.

### Could

- QR-kod för uttryckligen icke-känsliga värden.
- Ytterligare standardiserade ID-format när de har tydliga praktiska användningsfall.
- Lokal, explicit favoritlista för generatorinställningar, utan att lagra genererade hemligheter.
- Legacy-checksummor såsom SHA-1 eller MD5, endast tydligt märkta som olämpliga för säkerhetsändamål.

## 3. Aktörer

### A-001 – Användare

En person som vill generera, kopiera eller verifiera ett ID, token, hashvärde eller nyckelpar. Ingen registrering eller inloggning krävs.

## 4. Centrala användningsfall

### UC-001 – Generera ett ID

**Primär aktör:** Användare  
**Mål:** Få ett nytt värde av vald ID-typ.

Huvudflöde:
1. Användaren väljer generator, exempelvis UUID v7.
2. Appen visar relevanta inställningar för vald typ.
3. Användaren väljer `Generera`.
4. Appen visar det genererade värdet.
5. Användaren kan kopiera värdet direkt.

Resultat: Ett nytt korrekt formataterat ID finns tillgängligt i gränssnittet och kan kopieras.

### UC-002 – Generera flera värden

**Primär aktör:** Användare  
**Mål:** Få en batch med flera värden av samma typ.

Huvudflöde:
1. Användaren väljer generator och antal.
2. Appen genererar angivet antal värden.
3. Varje värde kan kopieras individuellt.
4. Alla värden kan kopieras tillsammans.

### UC-003 – Generera ett kryptografiskt slumpvärde

**Primär aktör:** Användare  
**Mål:** Skapa ett slumpvärde med vald säkerhetsnivå och representation.

Huvudflöde:
1. Användaren väljer slumpgenerator.
2. Användaren väljer antal bitar/bytes eller en preset.
3. Användaren väljer Hex, Base64 eller Base64URL.
4. Appen genererar värdet med en kryptografiskt säker slumpkälla.
5. Appen visar relevant information om längd/entropi.
6. Användaren kan kopiera resultatet.

### UC-004 – Beräkna hash

**Primär aktör:** Användare  
**Mål:** Beräkna en hash av text och, i Should-scope, lokal fil.

Huvudflöde:
1. Användaren väljer hash-algoritm.
2. Användaren matar in text eller väljer lokal fil när filstöd finns.
3. Appen beräknar hash lokalt.
4. Resultatet visas och kan kopieras.

### UC-005 – Generera kryptografiskt nyckelpar

**Primär aktör:** Användare  
**Mål:** Skapa ett nyckelpar för ett stödd användningsfall.

Huvudflöde:
1. Användaren väljer nyckeltyp och tillåtna inställningar.
2. Appen genererar nyckelparet lokalt.
3. Publik och privat del visas separat.
4. Appen markerar den privata nyckeln som känslig.
5. Användaren kan kopiera eller exportera respektive del när formatet stöds.

Detta användningsfall ligger i Should-scope och kräver separat teknisk och säkerhetsmässig verifiering innan implementation.

## 5. Funktionella krav

### Generatorer

**FR-001 – UUID v4 (Must)**  
Användaren ska kunna generera ett eller flera UUID v4.

**FR-002 – UUID v7 (Must)**  
Användaren ska kunna generera ett eller flera UUID v7.

**FR-003 – ULID (Must)**  
Användaren ska kunna generera ett eller flera ULID.

**FR-004 – URL-vänligt kort-ID (Must)**  
Användaren ska kunna generera ett eller flera kompakta URL-vänliga ID:n av NanoID-typ.

**FR-005 – Alfanumeriskt ID (Must)**  
Användaren ska kunna generera slumpmässiga alfanumeriska ID:n med valbar längd inom ett säkert och rimligt intervall.

**FR-006 – Numeriskt ID (Must)**  
Användaren ska kunna generera slumpmässiga numeriska ID:n med valbar längd.

**FR-007 – Kryptografiskt slumpvärde (Must)**  
Användaren ska kunna generera kryptografiskt säkra slumpvärden och välja representationen Hex, Base64 eller Base64URL.

**FR-008 – Säkerhetspresets (Must)**  
Appen ska erbjuda fördefinierade storlekar för kryptografiska slumpvärden, inklusive minst 128, 192, 256, 384 och 512 bitar.

**FR-009 – Anpassad längd (Must)**  
För generatorer där det är meningsfullt ska användaren kunna välja längd inom validerade gränser.

**FR-010 – Eget prefix/suffix (Should)**  
För lämpliga generatorer ska användaren kunna lägga till eget prefix och/eller suffix utan att appen presenterar dessa tecken som en del av slumpentropin.

**FR-011 – Eget alfabet (Should)**  
För lämpliga textgeneratorer ska användaren kunna ange ett eget alfabet. Appen ska förhindra tomma eller uppenbart ogiltiga alfabet.

### Batch och resultat

**FR-020 – Batchgenerering (Must)**  
Användaren ska kunna generera flera värden av samma typ i en operation.

**FR-021 – Kopiera ett värde (Must)**  
Varje genererat värde ska kunna kopieras direkt till clipboard.

**FR-022 – Kopiera alla (Must)**  
Vid batchgenerering ska användaren kunna kopiera alla genererade värden i ett konsekvent textformat.

**FR-023 – Kopieringsfeedback (Must)**  
Efter lyckad kopiering ska appen ge kort, tydlig återkoppling utan modal dialog som måste stängas.

**FR-024 – Ny generering (Must)**  
Användaren ska enkelt kunna ersätta föregående resultat med ett nytt värde eller en ny batch med samma inställningar.

**FR-025 – Ingen automatisk resultathistorik (Must)**  
Appen ska inte automatiskt lagra genererade värden mellan sessioner.

### Hash

**FR-030 – Text-hashning (Must)**  
Användaren ska kunna beräkna SHA-256, SHA-384 och SHA-512 för inmatad text.

**FR-031 – Filhashning (Should)**  
Användaren ska kunna välja en lokal fil och beräkna stödd hash utan att filen skickas till extern tjänst.

### Kryptografiska nycklar

**FR-040 – SSH-nyckelpar (Should)**  
Appen ska, om interoperabel och säker webbläsarimplementation kan verifieras, kunna generera SSH-nyckelpar i format som kan användas av vanliga OpenSSH-miljöer.

**FR-041 – Nyckeltyper (Should)**  
Stöd ska i första hand utvärderas för Ed25519 och därefter RSA när det finns ett motiverat kompatibilitetsbehov.

**FR-042 – Separat hantering av privat nyckel (Should)**  
Privat nyckel ska presenteras tydligt som känslig information och aldrig lagras automatiskt av appen.

**FR-043 – HMAC-hemlighet (Should)**  
Användaren ska kunna generera ett slumpvärde lämpligt som HMAC-hemlighet med tydligt angiven storlek.

### PWA och användarupplevelse

**FR-050 – PWA-installation (Must)**  
Appen ska kunna installeras som PWA på plattformar/webbläsare som stöder installation av webbappar.

**FR-051 – Offlineanvändning (Must)**  
Efter att appen har laddats minst en gång ska Must-generatorerna kunna användas utan nätverksanslutning.

**FR-052 – Responsiv navigation (Must)**  
Generatorer och inställningar ska vara lättåtkomliga på både små touchskärmar och större desktopskärmar.

**FR-053 – Tema (Must)**  
Appen ska stödja ljust och mörkt tema och initialt kunna följa användarens systeminställning.

## 6. Affärsregler

**BR-001 – Lokal generering**  
Kärnfunktionerna ska generera eller beräkna värden lokalt på användarens enhet.

**BR-002 – Kryptografisk slump**  
Generatorer som uttryckligen är avsedda för tokens, secrets, nyckelmaterial eller säkerhetsrelaterade slumpvärden får endast använda kryptografiskt säker slumpgenerering.

**BR-003 – Entropi**  
När appen visar entropi eller säkerhetsstorlek ska den skilja mellan slumpmässiga bitar och fasta användarvalda prefix/suffix.

**BR-004 – Secrets lagras inte automatiskt**  
Tokens, secrets och privata nycklar får inte sparas i beständig lokal lagring utan en framtida, uttrycklig och separat användarfunktion.

**BR-005 – QR för secrets**  
QR-kod får inte visas automatiskt för värden som appen klassificerar som känsliga.

## 7. Informationsbehov

Appen behöver hantera följande information i aktuell session:

- vald generator,
- generatorns inställningar,
- antal värden,
- genererade resultat,
- eventuell text/fil som användaren vill hasha,
- tema- och UI-inställningar.

Genererade secrets och privata nycklar ska betraktas som känsliga sessionsdata.

## 8. Integrationer

### GitHub Pages

Applikationen ska kunna publiceras som statiska filer via GitHub Pages. GitHub Pages används för distribution och hosting, inte för generering eller lagring av användarens värden.

### Webbläsarplattformen

Appen behöver kunna använda standardfunktioner i webbläsaren för bland annat kryptografisk slump, clipboard, PWA/offline och eventuell lokal filåtkomst där stöd finns.

Inga externa nätverkstjänster ska krävas för Must-funktionerna efter att appens statiska resurser har laddats.

## 9. Behörighet

- Ingen inloggning krävs.
- Alla funktioner i första release är tillgängliga för alla användare som kan öppna appen.
- Appen ska inte kräva konto hos GitHub för användning; GitHub är endast hostingplattform.

## 10. Fel- och undantagsfall

**ERR-001 – Clipboard saknas eller nekas**  
Om automatisk kopiering inte kan genomföras ska värdet fortfarande vara markerbart och appen ska ge begriplig återkoppling.

**ERR-002 – Ogiltiga generatorinställningar**  
Appen ska förhindra generering och tydligt ange vad som behöver korrigeras.

**ERR-003 – För stor batch**  
Appen ska ha en rimlig övre gräns för batchstorlek och förhindra inställningar som riskerar att låsa användargränssnittet.

**ERR-004 – Saknat browserstöd**  
Om en Should-funktion, exempelvis viss nyckeltyp eller Web Share, inte stöds på aktuell plattform ska appen ange detta och övriga funktioner fortsätta fungera.

**ERR-005 – Offlineuppdatering**  
Om en ny version inte kan hämtas offline ska senast tillgängliga fungerande version fortsätta kunna användas.

## 11. Icke-funktionella krav

**NFR-001 – Integritet (Must)**  
Genererade värden, hashunderlag, tokens och nyckelmaterial ska inte skickas till en server som del av appens kärnfunktioner.

**NFR-002 – Säker slump (Must)**  
Säkerhetsrelaterad slumpgenerering ska baseras på webbläsarens kryptografiskt säkra slumpfunktioner och får inte använda enklare pseudorandom-funktioner avsedda för icke-säkerhetskritisk användning.

**NFR-003 – Ingen beständig secret-lagring (Must)**  
Secrets och privata nycklar ska som standard endast finnas i minnet under aktuell session.

**NFR-004 – Responsivitet (Must)**  
Kärnflöden ska vara användbara på mobiltelefon, tablet och desktop utan horisontell sidscrollning i normal visning.

**NFR-005 – Touch och tangentbord (Must)**  
Primära funktioner ska vara användbara med touch och tangentbord.

**NFR-006 – Tillgänglighet (Must)**  
Gränssnittet ska använda semantiskt lämpliga kontroller, synliga fokusmarkeringar, begripliga etiketter och tillräcklig kontrast. Funktionalitet får inte vara beroende enbart av färg.

**NFR-007 – Offline (Must)**  
Must-funktioner ska fungera offline efter första lyckade laddningen av appversionens resurser.

**NFR-008 – Statisk hosting (Must)**  
Första releasen ska kunna köras från GitHub Pages utan applikationsserver eller backend-runtime.

**NFR-009 – Ingen telemetri som standard (Must)**  
Första releasen ska inte skicka användarbeteende, genererade värden eller andra uppgifter till analytics-/telemetritjänster.

**NFR-010 – Portabilitet (Must)**  
Appen ska fungera i aktuella moderna webbläsare på iOS/iPadOS, macOS, Android, Windows och Linux i den utsträckning de standardiserade webb-API:er som Must-funktionerna behöver stöds.

**NFR-011 – Prestanda (Must)**  
Generering av ett normalt enskilt ID eller slumpvärde ska upplevas som omedelbar och inte kräva nätverksanrop.

**NFR-012 – Säker dependency-användning (Must)**  
Externa bibliotek ska begränsas till sådant som behövs och får inte användas för egenimplementation av kryptografi när en etablerad plattformsfunktion eller välgranskad standardimplementation är lämpligare.

## 12. Acceptance criteria

**AC-001** När användaren väljer UUID v4 och genererar ett värde ska resultatet vara ett syntaktiskt giltigt UUID v4.

**AC-002** När användaren väljer UUID v7 och genererar flera värden ska varje resultat vara ett syntaktiskt giltigt UUID v7.

**AC-003** När användaren väljer ULID ska resultatet följa ULID-formatet.

**AC-004** När användaren genererar ett 384-bitars slumpvärde som Base64 ska underliggande slumpdata motsvara 48 bytes.

**AC-005** När samma 384-bitars slumpvärdestyp väljs som Base64URL ska resultatet använda URL-säker representation utan vanlig Base64-padding om formatet definierats så i arkitekturen.

**AC-006** När användaren trycker på kopieringsfunktionen och clipboard-operationen lyckas ska exakt det visade värdet finnas i clipboard och appen ge tydlig kort återkoppling.

**AC-007** När en batch genereras ska varje resultat kunna kopieras individuellt och `Kopiera alla` ska kopiera samtliga värden i samma ordning som de visas.

**AC-008** När appen laddats minst en gång och nätverket därefter kopplas bort ska användaren fortfarande kunna öppna appen och använda samtliga Must-generatorer.

**AC-009** När appen används på en liten mobilskärm ska primära generator-, generera- och kopieringsfunktioner vara åtkomliga utan desktoplayout eller horisontell sidscrollning.

**AC-010** När appen används med tangentbord ska användaren kunna navigera till generatorval, inställningar, genereringsknapp och kopieringsfunktioner och se vilket element som har fokus.

**AC-011** När användaren lämnar eller laddar om sidan ska tidigare genererade secrets inte återställas från appens permanenta lagring.

**AC-012** När texten `abc` hashats med SHA-256 ska resultatet motsvara den standardiserade SHA-256-hashen för exakt dessa UTF-8-bytes.

**AC-013** När en ogiltig längd eller batchstorlek anges ska appen inte generera resultat och ska förklara vilken inställning som är ogiltig.

**AC-014** När en webbläsare inte tillåter clipboard-skrivning ska det genererade värdet fortfarande kunna markeras/kopieras manuellt och användaren informeras om begränsningen.

**AC-015** Produktionsbygget ska kunna publiceras på GitHub Pages och Must-funktionerna ska fungera från den publicerade sidans faktiska base path.

**AC-016** Appens kärnfunktioner ska kunna verifieras utan att någon backendtjänst är tillgänglig.

## 13. Out of scope för första release

- Backend eller egen server-runtime.
- Användarkonton och autentisering.
- Synkronisering mellan enheter.
- Automatisk molnlagring eller serverlagring av genererade värden.
- Delad historik.
- Password manager-funktionalitet.
- Certifikatutfärdning eller egen PKI.
- Lagring eller förvaltning av SSH-private keys efter generering.
- Egenimplementation av kryptografiska primitiver.
- Native iOS-/Android-appar utöver PWA-installation.

## 14. Öppna frågor inför risk/feasibility och arkitektur

**OQ-001 – SSH-stöd**  
Vilket webbläsarstöd och vilken etablerad implementation krävs för att generera interoperabla Ed25519/OpenSSH-nycklar utan att införa oproportionerlig säkerhets- eller supply-chain-risk?

**OQ-002 – UUID v7-bibliotek eller egen formatlogik**  
Vilken standardimplementation ger bäst balans mellan liten bundle, korrekthet och underhållbarhet?

**OQ-003 – ULID/NanoID dependencies**  
Vilka format bör implementeras via etablerade små bibliotek och vilka kan med rimlig risk byggas direkt ovanpå Web Crypto?

**OQ-004 – Filhashning**  
Vilka filstorlekar ska stödjas utan att UI blockeras eller minnesanvändningen blir orimlig på mobila enheter?

**OQ-005 – GitHub Pages base path**  
Applikationen ska utformas så att den fungerar både på projektsida (`/<repo>/`) och, om den senare får egen domän, från `/`. Exakt byggkonfiguration beslutas i arkitekturen.
