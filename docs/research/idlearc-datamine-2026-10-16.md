# IdleArc v1.3.6 / 167 datamine notes (2026-10-16)

**Status:** Research evidence, not verified combat formulas. This document is isolated on a research branch; no production calculations should change solely based on it.

## Sources
- User-provided *base APK* `IdleArc (3).apk`: manifest reports package `com.mikhaelstudio.idlearc`, versionName `1.3.6`, versionCode `167`. SHA256 `cb215c27f1b513392e3778d729600c2ef94df3ad9faf31e2c53c0e468a5303d1`.
- Encrypted PCAPdroid captures `1111.pcapng` and `222`. **Do not commit raw captures or private player data.** Second capture has visible TLS SNI `idlearc.com`; traffic is encrypted.
- Partial config pasted by user, version `2026-10-14-002+chat+realms+tower+offsum+awaken+runewords+forge+affixcap+gems+gempresets+charslots+review+retaliation+raids+raidchat+raidquick+chestbuff+chestrunes+convergence+season_pass+spgift+pass-arc_pass_s2+posprog+dkinds+imghints+hatchcmp`. **Not full JSON**, so not safe for exhaustive diff.
- Previous extracted snapshot in `src/verified-game-data.js` begins `2026-10-06-002`. Previous known app build was v1.3.3 / 164.

## Verified APK observations
- Android manifest declares `requiredSplitTypes=base__abi,base__density`; supplied base APK has **no native `.so` libraries**. Flutter AOT application code for the real math would require ABI split. Strings `retaliation`, `deflection`, `bulwark` and `/config/game` do not occur in the supplied DEX files; this does *not* prove that the game lacks those mechanics.
- `assets/flutter_assets/assets/images` has **870 bundled image files**:
  - items 450 (231 root-level, 128 skins, 50 materials, 41 gems)
  - class skill icons 90 (**18 per class** for archer, druid, mage, rogue, warrior)
  - tower 108, monster 80, generic icon 40, pet 33, biome 24, boss 10, goblin 10, root 9, dungeon 8, season-pass 5, general skills 3.
- `classes/skills/warrior/warrior_deflection.webp` is present. Art, not damage formula.
- **Material-image gaps:** Config references `glass-carapace`, `crystal-stinger`, `creeper-thorn`, `mirage-essence`, `vitric-core`, `gloomfang-venom`, `stormglass-shard`, `razorback-bristle`, `elderwood-heart`, `warlord-totem`; **none** appear as filename substrings in provided base APK. Don't infer live game lacks their images; they may be remote/elsewhere. Track for Item Codex/Pathfinder.

## Network limitations
- `1111.pcapng`: 140 packet blocks, no observed IdleArc host; mainly DNS-over-TLS, Google, capture-related connections.
- `222`: 147 packet blocks, confirmed `idlearc.com` TLS connection, roughly 110,697 bytes incoming TLS TCP payload. **No readable API endpoint, response JSON, player stats, or combat events**. Payload size alone cannot identify config or character data.
- Need decrypted responses or copied response bodies, with authentication headers removed.

## Config excerpt findings, not runtime proof
- Item tier maximum levels: Normal 4 / Uncommon 9 / Rare 14 / Epic 19 / Legendary 24 / Infernal 30; affix slots 0–5.
- `upgrade_failure` and `tier_upgrade_failure` are distinct. The latter stage rates `0, 0.1, 0.2, 0.35, 0.5`; former includes level thresholds, incremental failure, pity acceleration, max `0.85`, and failure refund `0.3`. Do not assume full upgrade formula from coefficients.
- `monster_material_requirements.awaken_overrides_by_band`: at least two bands, A1 examples band1 `glass-carapace 86` / `crystal-stinger 81`; band2 `glass-carapace 108` / `crystal-stinger 101`. Band selection rule not yet established.
- Material selection changes non-monotonically at level 24→25. Preserve per-level tables in Pathfinder rather than interpolate.
- New relative version-marker tokens include `review`, `raidquick`, `imghints`, `hatchcmp`; mere version-string markers, not independently confirmed active features.

## Retaliation investigation (NOT SOLVED)
- Defense, Strength, reflect/retaliation modifiers and blocked-hit conditional are hypotheses based on the displayed breakdown, not an established combat formula.
- Next: full config JSON; before/after character stat API responses; paired combat samples for blocked vs unblocked hits; isolate Defense / Strength / Increased Strength / Retaliation changes. Track observed input/output, multiplier stacking and rounding.

## Arcana tasks
1. **Build Studio**: only implement damage predictions after controlled combat validation.
2. **Pathfinder / upgrade costs**: verify awakened band key and failure/pity rules; add precise material override tables.
3. **Item Codex**: reconcile 10 material-image lookup gaps; map item IDs to assets using authoritative item definitions.
4. **Skill Tree**: map 90 skill icons to verified skill IDs using existing developer permission.
5. **Research hygiene**: never commit raw user capture/credentials; track confidence tags: `CONFIG`, `ASSET`, `NETWORK-METADATA`, `HYPOTHESIS`, `RUNTIME-VERIFIED`.

**No application code or production website changed by this research note.**
