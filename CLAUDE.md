# PracticePlanner

Planeringsverktyg för träningspass och säsong, för tränare på iPad. En del av Handbollssviten (Tracker, Teambuilder, Playbook, Matchanalys). Appen är på svenska (UI, kommentarer och commit-meddelanden).

Det gemensamma för sviten (jämförelse av apparna, förslaget om gemensam profil) står i `trenchrox/handbollssviten`, `CLAUDE.md`. ID-regler och dataformat står i `suite-schema.md` i det här repot. Läs den innan du ändrar ID:n eller export/import.

## Hårda regler

- **Appen är en enda HTML-fil**, `practiceplanner.html`. Dela inte upp CSS eller JS i separata filer.
- Inget byggsteg, inga beroenden, ingen paketfil. Filen öppnas direkt i webbläsaren eller serveras statiskt.
- Allt är på klientsidan. Ingen server, inget konto, ingen inloggning. Appen kan hantera uppgifter om barn (spelar-ID från Teambuilder), så det här är inte förhandlingsbart.
- Ändra aldrig lagringsnyckeln eller datamodellen utan migrering. Användarna har riktig data på sina enheter.
- Lägg inte till PIN eller lösenord. Inloggning i sviten hör hemma på svitens startsida (se "Gemensam profil").
- Byt aldrig namn på repot eller på `practiceplanner.html` när appen väl ligger ute. Lagring och service worker är knutna till adressen.

## Filer

| Fil | Innehåll |
|---|---|
| `practiceplanner.html` | Hela appen (~170 kB). Typsnitten är base64-inbäddade i `@font-face`. |
| `index.html` | Bara en omdirigering till `practiceplanner.html`, så att `…/practiceplanner/` fungerar. Ingen app-kod. Det enda undantaget från regeln om en enda HTML-fil. |
| `suite-schema.md` | Sviteövergripande ID- och dataformat, version 1. Kopia, ska hållas lika i alla repon. |
| `CLAUDE.md` | Den här filen. |

Finns inte än: `manifest.json`, `sw.js`, ikoner. Se "Att göra".

## Design

Följer Tracker (`trenchrox/handball_g_trk`), eftersom båda är arbetsverktyg för iPad. Kompendierna (Roboto Slab och Open Sans, ljust papper) är dokument och ska inte vara förebild.

- **Typsnitt:** `Big Shoulders` 700 för rubriker och siffror (smalt, rubrikstorlekarna är därför höjda ca 40 %), `Instrument Sans` 400 och 700 för text. Båda är kopierade som base64 ur Trackers fil. Vikt 600 mappas till 700.
- **Hörn:** 0 (skarpa), som Tracker.
- **Accent:** turkos, `--accent: #1ed6bd` (mörkt) och `#0a8f7f` (ljust). Vald för att ingen annan app i sviten använder den. Gult är Tracker, blått Teambuilder, grönt Playbook, rött/rosa, orange och ljusblått används av kompendierna och manualerna. Använd turkos för primärknappar, aktiv menyrad, fokusring och filter. Gult, grönt och rött finns bara som statusfärger (påbörjad, planerad, för långt) och i övningsgruppernas färger.
- **Tokens** på `:root`: `--bg`, `--panel`, `--card`, `--card2`, `--line`, `--text`, `--muted`, `--accent`, `--on-accent`, `--yellow`, `--blue`, `--green`, `--purple`, `--red`. Ytor är Trackers `#1c1c1e` och `#2c2c2e`.
- **Ljust tema:** `body.light` ändrar tokens. Valet sparas i `S.theme` (`'dark'` eller `'light'`, saknas = mörkt) och `applyTheme()` sätter klassen och `theme-color`.
- **Övningsgrupper** har färg i konstanten `GROUPS` (FP, SK, HA, LK, FS, OF, målvakt, BAS, EG). Färgerna är Apple-paletten som Tracker använder.
- **Stående iPad (≤980 px):** menyn blir en rad med `Mer ▾` för filåtgärder och tema. Övningsbanken är en utfällbar panel (knappen `#bankToggle` sätter klassen `bank-open` på `#planView`). Varje övning har en `+`-knapp, eftersom drag och släpp är svårt med touch. Samma `+`-knapp visas på alla enheter utan hover.
- **Utskrift** (`#print`) har egen CSS i `@media print` och är vit.

## Filens struktur

1. `<head>`: meta (viewport med `viewport-fit=cover`, `theme-color`, `color-scheme`, `apple-mobile-web-app-capable`), `@font-face`, ett `<style>`-block.
2. `<body>`: `<nav class="side">`, översiktsvyn `#overView`, planvyn `#planView` (bank + passplan), dialogerna `#dlgEx`, `#dlgSess`, `#dlgNewEx`, `#print` och `#toast`.
3. Ett `<script>` utan moduler. Ordning: `APP_VERSION`, konstanter (`BUILTIN` = inbyggda övningar, `GROUPS`, `CHIPS`, `KEY`), tillstånd (`S`), `load`/`save`, hjälpfunktioner (`rid`, `esc`, `toast`), bank (`renderBank`), passplan (`render`, `addBlock`, drag och släpp), dialoger, import/export, utskrift (`buildPrint`), säsong och översikt (`occurrences`, `renderOverview`, `renderSetup`), `show()`.

### Vyer

| Vy | Syfte |
|---|---|
| `#overView` | Säsongsöversikt: alla träningar vecka för vecka med status. Om säsong saknas visas inställningen för den. |
| `#planView` | Ett pass: övningsbank till vänster (panel i stående), tidslinje med ett spår per nivå eller plan. |

`show()` växlar mellan dem med `S.view` (`'over'` eller `'plan'`).

## Konventioner i koden

- Vanilla JS, ingen ramverkskod. Rendering sker genom att bygga HTML-strängar och sätta `innerHTML`. **Användartext ska alltid gå genom `esc()`.**
- ID:n skapas med `rid(prefix)`: `prefix_` plus 8 tecken a–z och 0–9, som i `suite-schema.md`. Inbyggda övningar har kompendiets kod (`ex_FS11`). Egna övningar får `ex_eg_…` och koden `EG1`, `EG2` …
- Skriv ändringar till `S` och anropa sedan `save()`.

## Datamodell

Lagring: `localStorage`, nyckel `handbollssviten.practiceplanner.v1` (äldre nyckel `handbollssviten.passplaneraren.v1` läses om den nya saknas). **Hela appens data är ett JSON-objekt `S`.** `save()` skriver hela objektet.

```
S = { own: [exercise],        // egna övningar (inbyggda ligger i BUILTIN i koden)
      sessions: [session],
      groups: [group],        // importerade träningsgrupper från Teambuilder
      seasons: [season],
      season?, current, view, theme? }

session = { id: ses_…, name, date, venue, lengthMin, levelSplit, doubleCourt,
            dayId?,             // koppling till träningsdag i säsongen
            tracks: [{ id: trk_…, name, court: 'A'|'B', groupId: grp_…|null }],
            blocks: [{ id: blk_…, exerciseId, trackId: trk_…|'all', startMin, durMin }] }
```

Säsongsobjektet (`seasons[]`: namn, första och sista träning, träningsdagar, uppehåll) är härlett ur `renderSetup` och `occurrences`. Läs koden innan du förlitar dig på fälten.

Export och import är filen `{ schema: 'handbollssviten/planner@1', exercises, sessions, groups }`. **Teman och säsongsdata följer inte med.** Import och export ska följa `suite-schema.md`. Ändras formatet höjs versionen i `schema` (`planner@2`) och äldre filer ska fortfarande kunna läsas.

Nya fält läggs till som valfria med standardvärde (som `S.theme`) i stället för att kräva ny data.

## Versionering

- Versionen står i en enda konstant: `const APP_VERSION = '1.0'` överst i scriptet. Den visas i sidomenyn (`#appVersion`). Ändra den inte på något annat ställe.
- **Andra siffran höjs** vid nya funktioner och fixar (1.0 → 1.1).
- **Första siffran höjs** när lagringsformatet ändras (till exempel byte från `localStorage` till IndexedDB). Då krävs alltid en migrering av befintlig data.
- **Höj alltid versionen vid varje ändring av `practiceplanner.html`.** När en service worker finns styr versionen dess cache.
- Appens version och `schema`-versionen i exportfilen är två olika saker.

## Gemensam profil (inte beslutad)

Inloggning i sviten ska ske på startsidan, inte i varje app. Förslaget i `trenchrox/handbollssviten` (`CLAUDE.md`, "Förslag: gemensam profil") är en profil i `localStorage` under nyckeln `svit_session` med `{version, lagId, namn, logga?, farg?, aldersgrupp?}`. Det är ingen riktig inloggning, eftersom GitHub Pages inte kan kontrollera lösenord.

När det är beslutat ska PracticePlanner:
- läsa `svit_session` vid start och inte ha någon egen inloggning,
- knyta sin data till `lagId` så att import till fel lag stoppas,
- fungera fristående när profilen saknas.

Inget av detta är byggt. Läs inte och skriv inte `svit_session` förrän det är beslutat. Öppen fråga: på iPad kan en app på hemskärmen ha egen lagring, så profilen från startsidan syns kanske inte i en installerad app. Det måste provas på en riktig iPad.

## Servering

- Appen serveras från GitHub Pages ur det här repot (`trenchrox/practiceplanner`).
- Den exakta adressen är inte bekräftad. Fyll i den här när den är känd: `[adress]`.
- Lägg inte till en `sw.js` med brett scope som kan ersätta en annan apps service worker på samma domän. Använd cachenamnet `handboll-planner-v` + `APP_VERSION` och radera bara cacher med det prefixet.

## Att göra

- `manifest.json`, `sw.js` och ikoner (appen är inte installerbar än).
- Beslut om lagring: nuvarande `localStorage` räcker för små datamängder men tål mindre än IndexedDB. Byte kräver migrering och version 2.0.
- Gemensam profil (se ovan).
- Testa på en riktig iPad: stående och liggande, touch, tillägg via `+`, utskrift.
- Drag och släpp med touch är obeprövat på iPad.

## Arbetssätt

- **Fråga alltid före commit och push.** Efter varje ändring: beskriv vad som ändrats och fråga om det ska pushas. Skapa aldrig PR utan att användaren ber om det.
- Läs bara de delar av filen som behövs. De första raderna med `@font-face` är enorma base64-rader, så använd `grep -n` och undvik att skriva ut hela rader.
- Verifiera ändringar genom att öppna filen i en webbläsare (Playwright med Chromium). Testa både tomt tillstånd (ny säsong) och med data, i mörkt och ljust tema, samt stående (820 px) och liggande (1180 px) format.
- Commit-meddelanden på svenska.
