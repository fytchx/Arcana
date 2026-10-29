# IdleArc ML XP research: screenshot calibration (October 28, 2026)

## Purpose and scope
This file documents the **experimental** Monster Level XP model used by the Arcana **preview** calculator. Neither a recovered server formula nor confirmed XP-granting kill rules are available. Do **not** promote these estimates to the authoritative live wiki.

Input: `MLxp.zip` with 36 images and 3 identical duplicate pairs (33 unique images), together with a few earlier community screenshots from the same research thread. Some images show the same ML from different positions on the biome list. Keep progression ML and the level actually being fought **separate**.

## Verified progress requirements (player-visible, rounded)

| Progress ML | Displayed XP to next ML | Progress ML | Displayed XP to next ML |
|---:|---:|---:|---:|
| 184 | 124.49K | 210 | 189.52K |
| 216 | 207.52K | 234 | 268.89K |
| 247 | 320.47K | 250 | 333.27K |
| 260 | 378.44K | 262 | 387.94K |
| 271 | 432.65K | 284 | 502.93K |
| 285 | 508.62K | 290 | 537.67K |
| 291 | 543.6K | 297 | 580.04K |
| 303 | 617.93K | 304 | 624.39K |
| 307 | 644K | 310 | 663.97K |
| 312 | 677.49K | 315 | 698.07K |
| 317 | 711.98K | 328 | 791.35K |
| 329 | 798.8K | 332 | 821.38K |
| 337 | 859.79K | 355 | 1.01M |
| 356 | 1.01M | 377 | 1.2M |
| 400 | 1.42M | 420 | 1.62M |
| 482 | 2.3M | 559 | 3.19M |
| 571 | 3.33M | | |

Do not treat values such as `3.19M` as known to the nearest 1 XP. The display itself has rounded to a granularity of approximately 10,000 XP at those levels.

### Updated empirical requirement fit
Let `z=(progressML-300)/100`. Fit:

```text
XP_to_next = round(
598801.760018
+ 631551.611753*z
+ 202096.479878*z²
- 3048.16010589*z³
- 10654.7857437*z⁴
+ 58.3786439647*z⁵
+ 412.03319736*z⁶
)
```

It matches every recorded display value within that display's rounding precision; the largest deviation among the sub-million, two-decimal-K samples is 4 XP; the largest deviation against the rounded million-scale samples is approximately 4,281 XP. This does **not** mean the actual server formula is polynomial or that mid-range values are exact. The preview input is strictly bounded to progress ML 184–571; do not extrapolate the fitted polynomial beyond those samples.

## Biome card ML XP per kill

Each biome displays an XP-per-kill number in the small ascending-arrow badge. The base values observed are:

| Biome | Base XP |
|---|---:|
| Verdant Woods | 4 |
| Scorched Sands | 6 |
| Murky Depths | 8 |
| Frozen Peaks | 10 |
| Shadow Realm | 14 |
| Infernal Pits | 20 |
| Elderwood | 24 |
| Glasslands | 27 |
| Drowned Abyss | 30 |
| Shattered Summit | 33 |
| Umbral Rift | 36 |
| Oblivion's Crown | 39.6 |

All relevant sampled cards are consistent with:

```text
Biome_card_XP_per_kill = round_to_2_decimals(
  biome_base * (1 + (fightingML - 280) / 400)
)
```

Useful crosschecks:
- Progress ML 304 with normal fighting-level scaling: Umbral Rift 38.16 (36×1.06), Verdant Woods 4.24.
- Progress ML 337: Oblivion's Crown 45.24 (39.6×1.1425).
- Progress ML 400: Oblivion's Crown 51.48 (39.6×1.30).
- Progress ML 216 shows Glasslands 20.25 and Verdant Woods 3, indicating a multiplier of **0.75**, **equivalent** to fighting ML **180** under this formula, despite the character's progress showing ML 216. Fighting ML 180 is inferred, not separately visible in those screenshots.
- Progress ML 559 and 571 each show Crown 61.38 and Verdant Woods 6.2 (multiplier **1.55**, equivalent to fighting ML **500**). These screenshots do **not** prove a server-side XP cap beyond fighting ML 500: the players could simply have been fighting at ML 500.

In the preview calculator, support the formula only for a **specified/inferred fighting ML 180–500**. If progress ML is above 500 with no independently specified fighting ML, leave XP per kill unknown unless the player supplies a measured card value. Never automatically conflate progress ML with fighting ML above 500.

## Other rules and limits
- The chosen monster's lowest/middle/highest position can apply the documented −10%/0/+10% in eligible biomes. Do not multiply by this factor twice if actual per-monster XP is supplied instead of the biome-wide card value.
- The configured position mechanic starts at biome order 3 (first two biome positions unaffected).
- Estimated kill counts need actual XP-awarding kills/sec; an extra-kill visual is not automatically an additional ML XP-awarding kill.
- Any farming-time estimate is conditional on sustained XP-awarding kill rate and the chosen fighting level. The model is not a claim of exact drop, death, or idle timing.
- Keep source screenshots out of the public GitHub repo unless contributors explicitly authorize publishing the images.

## Highest-value next observations
1. A clip with **both** the current progress ML and the explicit fighting ML showing the settings and one biome card. Especially useful above 500.
2. Confirm card XP/kill vs actual ML XP bar change for the weakest, middle, and strongest monster positions.
3. Additional exact progress-ML requirements between 420–559 and beyond 571, particularly where the UI displays more than two significant fractional digits.
4. Screenshots at truly selected fighting ML below 180 and above 500 to establish valid bounds or a real cap.
