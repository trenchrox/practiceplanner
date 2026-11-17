# Handbollssviten – gemensam ID- och datastandard

Version 1 · gäller Teambuilder, Tracker, Playbook, PracticePlanner och analysverktyget.

Lägg den här filen i varje repo och hänvisa till den från CLAUDE.md, så att alla appar använder samma ID:n.

## 1. ID-regler

- Ett ID skapas **en gång** och ändras aldrig – inte heller om namnet ändras.
- Format: `prefix_` + en kort slumpad nyckel (8 tecken, a–z och 0–9), till exempel `plr_8f3k2m9q`.
- Undantag: inbyggda övningar använder kompendiets kod, till exempel `ex_FS11`.
- ID:n är gemener, utan mellanslag, å, ä eller ö.

| Prefix | Vad | Skapas i | Exempel |
|---|---|---|---|
| `team_` | lag eller årskull | Teambuilder | `team_f13a8k2m` |
| `plr_` | spelare | Teambuilder | `plr_8f3k2m9q` |
| `grp_` | träningsgrupp | Teambuilder | `grp_x4v9t2pa` |
| `ex_` | övning | PracticePlanner | `ex_FS11`, `ex_eg_4p9xk2m1` |
| `ses_` | träningspass | PracticePlanner | `ses_k29d8x1q` |
| `trk_` | spår i ett pass (nivå eller plan) | PracticePlanner | `trk_a1b2c3d4` |
| `blk_` | övning inlagd i ett pass | PracticePlanner | `blk_9z8y7x6w` |
| `mat_` | match | Tracker / analys | `mat_2m4n6p8q` |
| `ssn_` | säsong | alla | `ssn_2026_27` |

## 2. Övningskoder

| Grupp | Kod | Källa |
|---|---|---|
| Fånga och passa | FP | Utespelarkompendiet |
| Skott | SK | Utespelarkompendiet |
| Hög arm | HA | Utespelarkompendiet |
| Lekar | LK | Utespelarkompendiet |
| Fart och fas 1–2 | FS | Utespelarkompendiet |
| Offensivt försvar | OF | Utespelarkompendiet |
| Reaktion, position, styrka, utkast, straff | RE, PO, ST, UK, SF | Målvaktskompendiet |
| Bas (FYS, dans, matchspel m.m.) | BAS | PracticePlanner |
| Egna övningar | EG | skapas av tränare |

Koder återanvänds aldrig. Tas en övning bort ur kompendiet (som SK3) står koden tom.

## 3. Dataformat

### Träningsgrupp (export från Teambuilder)
```json
{
  "schema": "handbollssviten/groups@1",
  "exportedAt": "2026-11-17T20:00:00Z",
  "groups": [
    { "id": "grp_x4v9t2pa", "name": "Victoria tis – nivå 1–2", "teamId": "team_f13a8k2m",
      "level": "1-2", "playerIds": ["plr_8f3k2m9q", "plr_2b7c5d1e"] }
  ]
}
```
**Följer aldrig med:** Teambuilders dolda nivåpoäng, PIN eller relationsregler. Bara gruppindelning och spelar-ID.

### Övning
```json
{ "id": "ex_FS11", "code": "FS11", "name": "Köpenhamn med M6", "group": "FS",
  "age": "11–14 år", "steps": ["…"], "trains": "…", "think": ["…"],
  "easier": "…", "harder": "…", "watch": "…", "goalkeeper": "…", "source": "utespelare" }
```

### Träningspass
```json
{
  "id": "ses_k29d8x1q", "name": "Victoria tis – nr 1", "date": "2026-11-18",
  "venue": "Victoria", "lengthMin": 90,
  "levelSplit": true, "doubleCourt": true,
  "tracks": [
    { "id": "trk_a1b2c3d4", "name": "Nivå 1–2", "court": "A", "groupId": "grp_x4v9t2pa" },
    { "id": "trk_e5f6g7h8", "name": "Nivå 2–3", "court": "B", "groupId": null }
  ],
  "blocks": [
    { "id": "blk_9z8y7x6w", "exerciseId": "ex_BAS1", "trackId": "all", "startMin": 0, "durMin": 30 },
    { "id": "blk_1q2w3e4r", "exerciseId": "ex_FS9", "trackId": "trk_a1b2c3d4", "startMin": 40, "durMin": 15 }
  ]
}
```
`trackId: "all"` betyder att övningen gäller alla spår, till exempel FYS innan gruppen delar sig.

### Fil för export och import
```json
{ "schema": "handbollssviten/planner@1", "exercises": [], "sessions": [], "groups": [] }
```

## 4. Lagring

- Varje app sparar lokalt (IndexedDB eller localStorage) och kan **exportera och importera** JSON enligt formaten ovan.
- Ligger apparna under **samma webbadress** (samma domän) kan de på sikt dela en gemensam databas, `handbollssviten`, i webbläsaren.
- Ändras formatet höjs versionen i `schema`, till exempel `handbollssviten/groups@2`, och apparna läser äldre versioner.
