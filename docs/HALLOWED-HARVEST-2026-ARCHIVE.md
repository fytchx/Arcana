# Hallowed Harvest 2026 — event archive and homepage handoff

**Status:** Past event, with a final Arcstone Halloween Shop phase through November 14, 2026. This is **historical event documentation**, not an active gameplay checklist.

## Confirmed schedule

The in-game help screenshots shared October 28, 2026 specify 16:00 Pacific time cutoffs:

| Event phase | End date | UTC cutoff |
| --- | --- | --- |
| Pumpkin earning, missions, invasions | November 4, 2026 | 2026-11-05T00:00:00Z |
| Pumpkin Shop and Hallowed Track | November 7, 2026 | 2026-11-08T00:00:00Z |
| Arcstone Halloween Shop | November 14, 2026 | 2026-11-15T00:00:00Z |

See [original event evidence](IDLEARC-1.3.9-HALLOWED-HARVEST.md) and the original Journal article `hallowed-harvest-2026-guide`.

## Homepage behavior after November 7

- Arcana Next Home returns focus to Pathfinder, Build Studio, the Handbook, non-seasonal latest news and featured builds.
- The finished event no longer occupies Home's current-event strip or the latest-news tile; while the last Arcstone shop is available, a compact text reminder links to the archived article, then disappears automatically after November 14.
- The Directory retains **Hallowed Harvest 2026** as a past-event link to the original Journal article. The News section keeps the article, but sorts it below ongoing coverage even if a historic `featured=true` flag persists in production `/data`.
- The classic `/classic` homepage hides its Halloween banner by default before JS hydration and retires it after the Pumpkin Shop closes. Its Journal teaser chooses a non-Halloween article when available.
- The Handbook source seed and Journal source seed frame the Halloween content as an archive.

## Safety and editorial caveats

- Source seed edits apply to **new data volumes**, not existing Journal/Handbook content stored on the live `/data` volume.
- Production articles may still require manual updates to their text and featured settings in Arcana's admin editor. Do not write to `/data` via deployment or replace the live volume.
- An existing unmerged Halloween PR (#96) is the intended review vehicle; this archive document does not authorize a merge.
- Review homepage behavior at phone width and the three UTC cutoff boundaries before the owner explicitly approves `Merge #96`.
