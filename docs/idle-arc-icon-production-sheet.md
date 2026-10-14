# Arcana × IdleArc — Game-Familiar Icon Production Sheet

**Status:** source mapping completed; **new icons not drawn or approved yet.** Do not mistake this sheet for finished artwork.

**Source:** `assets/official-art/manifest.json` (`official-inventory-2026-10-11-v4`). The GitHub repository already contains the indexed, official IdleArc sprite atlases. The user reports permission from Mik to use the artwork.

**Source verification:** All **60 target mappings** were checked against exact manifest category/key IDs. This verifies asset references, **not** whether an art piece is the best visual choice; tile appearance requires review before generation.

**Why this exists:** The current Arcana Minimal SVGs are generic and players do not recognize their shapes. Rebuild icons from recognizable game references without changing Arcana's Slate UI, layout, player themes, routes or data.

## Production rules

1. **Token** (currencies and materials): keep recognizable original art, native color, proportions and alpha; size in a matte neutral frame; user theme recolors the frame or selection outline, **not** actual game items.
2. **Derived silhouette** (equipment and class): extract the referenced tile from the verified sprite sheet, identify its dominant form and redraw a simplified layered icon. Preserve 2–3 identifying features. Use item-aware shapes where game equipment types differ. Do not generate arbitrary generic glyphs.
3. **Hybrid feature/stat icon:** combine simple game-recognizable motifs from only the referenced assets, then add restrained UI affordances. Differentiate Wiki, Codex, Guides, Builds and Build Studio deliberately.
4. **Accessibility:** must be recognizable at 20, 24 and 32 px (equipment may render at 36 px). No fake item artwork or wrong rarity indications. Icons must never replace text labels or be the only way to identify controls.
5. **Theming:** derived navigation silhouettes can obey independent icon accent/mode preferences; **unaltered game-art tokens do not get CSS hue rotation**. Existing 10 site accent colors and independent icon color settings remain.
6. **Game art provenance:** always retain the source atlas category, name, tile index and sprite sheet version. Do not publish claims of verified in-game mechanics based on icon design.
7. **Rollout:** build the first set in a preview-only feature branch. Show side-by-side old/new icons inside the actual Build Studio, homepage and Codex at mobile size. Keep easy per-icon rollback. Do not change production until visual approval.
8. **Source safety:** exact tile boundaries and transparency from official manifests; do not crop from a screenshot or invent missing art. Mark unknown categories for review.

## Priority and acceptance criteria

- **P0 (30):** thirteen loadout slots, five class emblems and twelve homepage/studio features. First visible upgrade. Acceptance: players distinguish all five classes, all 13 loadout slots and all six home destinations at a glance; offhand/main hand use the correct equipped item type; no mobile overflow or lost tap behavior.
- **P1 (12):** real currencies and materials. Acceptance: icons visually match their game sources, remain in original colors, and use the same asset resolver used by the Codex.
- **P2 (18):** stats and mechanics. Acceptance: retaliation, block, crit chance/damage and pet damage are distinguishable, no unsupported claim of official stat art.

## Mapped asset references

> `equipment:torch` is a manifest lookup key (category + item ID), not a URL. The accompanying machine-readable JSON has atlas URLs, tile indices, columns, rows and tile sizes for precise extraction.

### Equipment slots (13)

| # | Icon ID | Treatment | Exact IdleArc references | What the design should emphasize | Usage | Priority |
|---:|---|---|---|---|---|---|
| 1 | **Torch / utility** `torch` | derived-silhouette | `equipment:torch` (tile 179)<br>`skins:forge-torch` (tile 66) | Real torch bowl, handle and flame silhouette; not a potion flask. | Equipment slot, empty or selected | P0 |
| 2 | **Head** `head` | derived-silhouette | `equipment:chainmail-helm` (tile 39)<br>`equipment:leather-cap` (tile 80)<br>`equipment:visionary-hood` (tile 182) | Recognizable helmet/hood silhouette, with a single crown or face opening. | Gear grid, slot picker | P0 |
| 3 | **Necklace** `neck` | derived-silhouette | `equipment:adventurer-amulet` (tile 6)<br>`equipment:scholar-amulet` (tile 132) | Pendant with its actual hanging chain and stone outline. | Necklace gear slots | P0 |
| 4 | **Main hand** `weapon` | adaptive-silhouette | `equipment:iron-sword` (tile 75)<br>`equipment:wooden-bow` (tile 210)<br>`equipment:wooden-wand` (tile 215)<br>`equipment:iron-dagger` (tile 74) | Default weapon shape should be neutral; when an item is equipped, reflect its actual type (blade/bow/wand). | Main-hand gear slot and legal item picker | P0 ⚠️ |
| 5 | **Chest** `chest` | derived-silhouette | `equipment:leather-armor` (tile 78)<br>`equipment:chainmail-armor` (tile 36)<br>`equipment:bloodweave-vest` (tile 25) | Clear torso/shoulder armor form, broad silhouette and narrow waist. | Chest armor slot | P0 |
| 6 | **Off hand** `offhand` | adaptive-silhouette | `equipment:wooden-shield` (tile 213)<br>`equipment:leather-spellbook` (tile 83)<br>`equipment:leather-quiver` (tile 82) | Select shield/book/quiver silhouette from actual equipped off-hand type; no fixed shield for everyone. | Off-hand slot, equipment picker | P0 ⚠️ |
| 7 | **Ring I** `ring` | derived-silhouette | `equipment:adventurer-ring` (tile 13)<br>`equipment:scholar-ring` (tile 146) | Jewelry ring with readable inner aperture and setting; small UI numeral I outside source artwork. | Ring I slot | P0 |
| 8 | **Belt** `belt` | derived-silhouette | `equipment:cloth-belt` (tile 40)<br>`equipment:ranger-belt` (tile 107) | Broad belt with an obvious central buckle. | Belt slot | P0 |
| 9 | **Ring II** `ring2` | derived-silhouette | `equipment:adventurer-ring` (tile 13)<br>`equipment:scholar-ring` (tile 146) | Same recognizable game-inspired ring shape as Ring I; optional numeral II in UI chrome. | Ring II slot | P0 ⚠️ |
| 10 | **Utility I** `charm` | derived-silhouette | `skins:forge-satchel` (tile 60)<br>`icons:runic-core` (tile 20) | A simple utility pouch/relic holder, not a made-up equipable talisman. | Utility I slot | P0 ⚠️ |
| 11 | **Hands** `hands` | derived-silhouette | `equipment:leather-gloves` (tile 81)<br>`equipment:slayer-gauntlets` (tile 155) | Actual glove/gauntlet outline with articulated fingers. | Hands slot | P0 |
| 12 | **Feet** `feet` | derived-silhouette | `equipment:leather-boots` (tile 79)<br>`equipment:swiftstride-boots` (tile 166) | Recognizable game boot profile rather than abstract geometric feet. | Feet slot | P0 |
| 13 | **Utility II** `charm2` | derived-silhouette | `skins:forge-satchel` (tile 60)<br>`icons:runic-core` (tile 20) | Same neutral utility motif as Utility I; differentiate only with slot position/UI label. | Utility II slot | P0 ⚠️ |

### Class identity (5)

| # | Icon ID | Treatment | Exact IdleArc references | What the design should emphasize | Usage | Priority |
|---:|---|---|---|---|---|---|
| 14 | **Warrior** `warrior` | derived-emblem | `skills:warrior:deflection` (tile 78)<br>`skills:warrior:titans_grip` (tile 88)<br>`equipment:steel-crest-shield` (tile 158) | Physical defensive melee identity informed by real class skill silhouettes. | Build profile, class picker, guides | P0 ⚠️ |
| 15 | **Archer** `archer` | derived-emblem | `skills:archer:archery` (tile 1)<br>`skills:archer:perfect_shot` (tile 11)<br>`equipment:wooden-bow` (tile 210) | Bow/string or aiming silhouette; leave out unrelated wings or helmets. | Build profile, class picker, guides | P0 |
| 16 | **Mage** `mage` | derived-emblem | `skills:mage:spell_mastery` (tile 51)<br>`skills:mage:arcane_surge` (tile 38)<br>`equipment:wooden-wand` (tile 215) | Orb or magic focus shape matching actual Mage skill and wand design. | Build profile, class picker, guides | P0 |
| 17 | **Rogue** `rogue` | derived-emblem | `skills:rogue:umbral_blades` (tile 70)<br>`skills:rogue:shadow_echo` (tile 66)<br>`equipment:iron-dagger` (tile 74) | Recognizable paired blades/dagger form, sharper and narrower than Warrior. | Build profile, class picker, guides | P0 |
| 18 | **Druid** `druid` | derived-emblem | `skills:druid:wild_attunement` (tile 35)<br>`skills:druid:feral_bond` (tile 22)<br>`pets:bober-1` (tile 4) | Organic/nature bond motif informed by actual Druid skills, not generic leaf logo. | Build profile, class picker, guides | P0 ⚠️ |

### Home and system navigation (12)

| # | Icon ID | Treatment | Exact IdleArc references | What the design should emphasize | Usage | Priority |
|---:|---|---|---|---|---|---|
| 19 | **Build Studio** `build-studio` | hybrid-feature | `equipment:steel-plate-armor` (tile 160)<br>`icons:runic-core` (tile 20)<br>`currency:passive_point` (tile 3) | Loadout frame + recognizable rune core. Distinguished from ordinary Builds link. | Hero CTA, homepage, studio tab | P0 |
| 20 | **Wiki** `wiki` | hybrid-feature | `equipment:old-book` (tile 88)<br>`skins:forge-spellbook` (tile 63) | Open reference book: readable spreads and a plain page edge. | Homepage/wiki menus | P0 |
| 21 | **Tools** `tools` | hybrid-feature | `icons:runic-core` (tile 20)<br>`materials:astral_catalyst` (tile 4) | Functional forge core + measured/calculation mark, not a generic keyboard calculator. | Homepage tool menu | P0 |
| 22 | **Guides** `guides` | hybrid-feature | `equipment:old-book` (tile 88)<br>`skills:warrior:battle_focus` (tile 72) | Bookmarked manual with an unmistakable guide marker; separate from Wiki book. | Homepage/guides | P0 |
| 23 | **Builds** `builds` | hybrid-feature | `equipment:chainmail-armor` (tile 36)<br>`equipment:wooden-shield` (tile 213) | Saved equipment preset stack, not identical to Build Studio flagship sigil. | Community build cards | P0 |
| 24 | **Codex** `codex` | hybrid-feature | `equipment:old-book` (tile 88)<br>`materials:prism-stone` (tile 33)<br>`icons:runic-core` (tile 20) | Indexed inventory archive: small item specimen over a catalog outline. | Homepage, item browser | P0 |
| 25 | **Guild & Raid Finder** `guild-raid` | hybrid-feature | `icons:guildstone` (tile 11)<br>`world-bosses:rift-titan-1` (tile 3) | Actual Guildstone crest and compact raid-party outline; avoid fake class symbols. | Homepage/guild finder | P0 |
| 26 | **Rune Forge** `rune-forge` | hybrid-feature | `icons:runic-core` (tile 20)<br>`icons:rune-dust` (tile 18)<br>`icons:rune-reforge` (tile 19) | Preserve the in-game rune stone/cut and recognizable core silhouette. | Rune Forge tab/feature | P0 |
| 27 | **Class Skills** `class-skills` | hybrid-feature | `skills:warrior:deflection` (tile 78)<br>`skills:mage:spell_mastery` (tile 51) | Skill icon framing and branch marker inspired by actual skill artwork. | Build Studio skills tab | P0 |
| 28 | **Passive Tree** `passive-tree` | hybrid-feature | `currency:passive_point` (tile 3)<br>`icons:runic-core` (tile 20) | Connect passive-point glyphs with simple node paths; no random constellation. | Build Studio passive tab | P0 |
| 29 | **Pet Lab** `pet-lab` | hybrid-feature | `currency:pet_egg` (tile 4)<br>`pets:bear` (tile 2)<br>`currency:pet_shard` (tile 5) | Pet egg silhouette plus recognizable pet motif, no generic paw as sole symbol. | Pet calculator/lab | P1 |
| 30 | **Upgrade Calculator** `upgrade-calculator` | hybrid-feature | `materials:astral_catalyst` (tile 4)<br>`materials:adamantine-fragment` (tile 1)<br>`skins:forge-helm` (tile 54) | Forge/catalyst + incremental progression mark. | Upgrade calculator | P1 |

### Currencies and materials (12)

| # | Icon ID | Treatment | Exact IdleArc references | What the design should emphasize | Usage | Priority |
|---:|---|---|---|---|---|---|
| 31 | **Arcstone** `arcstone` | direct-token | `icons:arcstone` (tile 6) | Keep the recognizable official Arcstone art and native hues. | Balances, pricing, wiki | P1 |
| 32 | **Ruby** `ruby` | direct-token | `currency:ruby` (tile 6) | Keep the official ruby token exactly recognizable. | Balances, guild contributions | P1 |
| 33 | **Gold** `gold` | direct-token | `currency:coin` (tile 0) | Keep the official coin symbol and color identity. | Gold calculators, guilds | P1 |
| 34 | **Guildstone** `guildstone` | direct-token | `icons:guildstone` (tile 11) | Use the game's Guildstone design, not a generic gem. | Guild contributions, guild page | P1 |
| 35 | **Pet Egg** `pet-egg` | direct-token | `currency:pet_egg` (tile 4) | Official egg icon. Avoid replacing with a standard Easter egg silhouette. | Pet Lab, Codex | P1 |
| 36 | **Pet Shard** `pet-shard` | direct-token | `currency:pet_shard` (tile 5) | Official shard token, preserve native color. | Pet Lab, Codex | P1 |
| 37 | **Rune Dust** `rune-dust` | direct-token | `icons:rune-dust` (tile 18) | Official dust token. | Rune Forge, Codex | P1 |
| 38 | **Rune Reforge** `rune-reforge` | direct-token | `icons:rune-reforge` (tile 19) | Official rune reforge token. | Rune Forge, costs | P1 |
| 39 | **Runic Core** `runic-core` | direct-token | `icons:runic-core` (tile 20) | Official runic core shape. | Runes, recipes, costs | P1 |
| 40 | **Upgrade Catalyst** `upgrade-catalyst` | direct-token | `materials:astral_catalyst` (tile 4) | Keep precise catalyst artwork, not a generic sparkle. | Upgrades, Codex | P1 |
| 41 | **Gem** `gem` | direct-token | `gems:amber-rough` (tile 9)<br>`gems:garnet-rough` (tile 19) | Game gem cuts and original colors; do not recolor game item art to user accent. | Gem slots, Forge, Codex | P1 |
| 42 | **Gem Dust** `gem-dust` | direct-token | `gems:gem-dust` (tile 20) | Official gem dust artwork. | Crafting costs, Codex | P1 |

### Stats and mechanics (18)

| # | Icon ID | Treatment | Exact IdleArc references | What the design should emphasize | Usage | Priority |
|---:|---|---|---|---|---|---|
| 43 | **Attack Damage** `attack-damage` | hybrid-stat | `skills:warrior:mighty_strikes` (tile 82)<br>`equipment:iron-sword` (tile 75) | Weapon stroke with weight, not an arbitrary polygon. | Stats in build cards | P2 |
| 44 | **Flat Damage** `flat-damage` | hybrid-stat | `skills:warrior:crushing_blows` (tile 76) | Solid strike mark separate from proportional attack icon. | Stats in calculators | P2 |
| 45 | **Crit Chance** `crit-chance` | hybrid-stat | `skills:archer:perfect_shot` (tile 11) | Precision/target focal point, distinguish from Crit Damage. | Build stats | P2 |
| 46 | **Crit Damage** `crit-damage` | hybrid-stat | `skills:rogue:coup_de_grace` (tile 56) | Burst strike fragment, stronger shape than Crit Chance. | Build stats | P2 |
| 47 | **Defense** `defense` | hybrid-stat | `skills:warrior:iron_constitution` (tile 80)<br>`equipment:wooden-shield` (tile 213) | Protective plate/block silhouette, avoid identical Block Chance mark. | Build stats | P2 |
| 48 | **Block Chance** `block-chance` | hybrid-stat | `skills:warrior:deflection` (tile 78) | Parry/deflection angle, differentiable from static defense. | Build stats | P2 |
| 49 | **Retaliation** `retaliation` | hybrid-stat | `skills:warrior:deflection` (tile 78)<br>`skills:warrior:relentless_assault` (tile 84) | Damage redirected outward from armor. Verify against in-game mechanic language. | Warrior guides and stats | P2 ⚠️ |
| 50 | **Pet Damage** `pet-damage` | hybrid-stat | `skills:archer:pet_mastery` (tile 12)<br>`skills:druid:feral_bond` (tile 22) | Pet silhouette plus controlled offensive mark. | Pet builds | P2 |
| 51 | **Strength** `strength` | hybrid-stat | `skills:warrior:titans_grip` (tile 88) | Heavy-lift grip shape, not generic bicep. | Attribute displays | P2 |
| 52 | **Dexterity** `dexterity` | hybrid-stat | `skills:archer:archery` (tile 1) | Precise bow or quick draw. | Attribute displays | P2 |
| 53 | **Intelligence** `intelligence` | hybrid-stat | `skills:mage:spell_mastery` (tile 51) | Arcane focus central glyph. | Attribute displays | P2 |
| 54 | **Gold Gain** `gold-gain` | hybrid-stat | `currency:coin` (tile 0)<br>`skills:rogue:pickpocket` (tile 63) | Official gold token with small plus/arrow UI mark. | Gold farming guides | P2 |
| 55 | **EXP Gain** `exp-gain` | hybrid-stat | `currency:passive_point` (tile 3)<br>`skills:archer:hunters_instinct` (tile 8) | Clear upward progression motif, not a claimed official EXP sprite. | XP calculators and guides | P2 ⚠️ |
| 56 | **Drop Bonus** `drop-bonus` | hybrid-stat | `skills:rogue:treasure_hunter` (tile 69)<br>`items:wardplate` (tile 0) | Loot highlight and item outline. | Drop Bonus guide, item Codex | P2 |
| 57 | **Extra Kill** `extra-kill` | hybrid-stat | `skills:warrior:culling_strike` (tile 77) | Second target/kill indicator with a concise split stroke. | ML farming calculators | P2 |
| 58 | **Boss Damage** `boss-damage` | hybrid-stat | `world-bosses:rift-titan-1` (tile 3)<br>`skills:warrior:titanic_blow` (tile 87) | Boss crown/face outline with impact mark; do not copy boss portrait into tiny stat tile. | Raid and stat views | P2 |
| 59 | **All Class Skills** `all-class-skills` | hybrid-stat | `skills:mage:spell_mastery` (tile 51)<br>`skills:archer:archery` (tile 1)<br>`skills:warrior:deflection` (tile 78) | Neutral multi-class signifier, not a Mage-specific token. | Torch/ACS, gear comparison | P2 |
| 60 | **Armor** `armor` | hybrid-stat | `equipment:chainmail-armor` (tile 36) | Defensive chest material, separate from block icon. | Gear and build stats | P2 |

## Outstanding decisions / don't fake these

- **Utility I/II:** source references are `forge-satchel` and `runic-core`, which are **inspiration**, not evidence those objects can be equipped. Treat the slot silhouette as provisional until visually and mechanically checked.
- **Main hand / offhand:** actual eligible gear determines the final icon. No universal sword or shield that misrepresents a bow, wand, spellbook or quiver.
- **Class emblems:** skill illustrations are reliable game references but are **not verified to be the official class symbols**. Redraw, then compare in a contact sheet with representative skills for each class.
- **All Class Skills and EXP Gain:** the manifest has related artwork but no confirmed dedicated token. Do not label an invented motif as official.
- **Talisman:** no matching `talisman` sprite was verified in this atlas. Do not make up a direct token; search additional source archives first.

## Source review and handoff checklist

- [x] Indexed artwork atlas located in the repository, no extra upload needed for initial mappings.
- [x] Exact category/key sources validated for all 60 targets.
- [ ] Generate contact sheets for the cited official atlas tiles.
- [ ] Compare 3 candidate silhouettes for each of the 13 equipment slots and 5 classes at 24 and 40 px.
- [ ] Choose derived styling: neutral fill, restrained internal highlight and an optional icon-accent-only detail.
- [ ] Review the 12 hybrid system icons in context of actual homepage and Build Studio tabs.
- [ ] Use cropped original art for 12 verified tokens; check transparent edges and legends.
- [ ] Test on 360, 390 and 440 px Android views; verify all theme palettes and low-contrast cases.
- [ ] Hold a clear before/after visual review before replacing any production icon mappings.

**Machine-readable file:** `docs/idle-arc-icon-source-map.json`.
