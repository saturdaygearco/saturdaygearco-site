# Sitewide image refinement — resumed October 11, 2026

Status: audit complete; replacement implementation and desktop/mobile QA pending. No production changes.

Base: f548e2daeeab42ed462c8d2ca65ba32a953e006f. All 39 HTML files and shared theme reviewed. Keep approved design, copy, URLs, SEO, affiliate destinations and GA4 unchanged. Use owner or free appropriately licensed photos. Correct exact model for product-specific photos; stock conveys no ownership/testing.

## Shared hero finding

Shared .hero background in assets/garage-theme.css uses garage/workshop-960.webp. Article-specific heroes currently inherit that generic workshop image. Replace through article-scoped photo mapping; same article's card and hero should use the same subject/photo family.

## Existing non-logo image inventory

| Page | Existing images | Inline backgrounds |
|---|---|---|
| 404.html | None | Shared theme default |
| about.html | None | Shared theme default |
| affiliate-disclosure.html | None | Shared theme default |
| author/nicholas.html | None | Shared theme default |
| cooking.html | assets/garage/cooking-640.webp, assets/garage/cooking-640.webp, assets/garage/cooking-640.webp, assets/garage/cooking-640.webp | assets/garage/cooking-1200.webp |
| editorial-policy.html | None | Shared theme default |
| garage.html | assets/milwaukee-2656-20-owner-side.webp, assets/garage/workshop-640.webp, assets/garage/generator-640.webp, assets/garage/workshop-640.webp, assets/garage/workshop-640.webp, assets/garage/generator-640.webp | Shared theme default |
| guides.html | None | Shared theme default |
| guides/best-robotic-pool-cleaners.html | ../assets/beatbot-a200-pro-owner-photo.webp | Shared theme default |
| guides/can-a-power-station-run-a-refrigerator-overnight.html | None | Shared theme default |
| guides/can-you-run-a-generator-in-the-rain.html | None | Shared theme default |
| guides/drill-vs-impact-driver.html | ../assets/milwaukee-2656-20-owner.webp, ../assets/milwaukee-2656-20-owner-side.webp | Shared theme default |
| guides/dual-fuel-generator-gasoline-vs-propane.html | None | Shared theme default |
| guides/electric-vs-gas-pressure-washer-driveway.html | None | Shared theme default |
| guides/generator-starting-watts-vs-running-watts.html | None | Shared theme default |
| guides/grill-vs-griddle-vs-pellet.html | None | Shared theme default |
| guides/hard-cooler-vs-soft-cooler.html | None | Shared theme default |
| guides/how-big-a-cooler-do-you-need.html | None | Shared theme default |
| guides/how-high-should-you-mow-your-lawn.html | None | Shared theme default |
| guides/how-long-does-ice-last-in-a-cooler.html | None | Shared theme default |
| guides/how-much-generator-do-you-need.html | None | Shared theme default |
| guides/pool-day-simple-scoop-owner-experience.html | None | Shared theme default |
| guides/portable-power-station-sizing.html | None | Shared theme default |
| guides/pressure-washer-psi-vs-gpm.html | None | Shared theme default |
| guides/pressure-washer-surface-cleaner-sizing.html | None | Shared theme default |
| guides/shop-vac-cfm-vs-water-lift.html | None | Shared theme default |
| guides/two-vs-three-burner-gas-grill.html | None | Shared theme default |
| guides/variable-speed-pool-pump-worth-it.html | None | Shared theme default |
| guides/what-can-a-4500-watt-generator-run.html | None | Shared theme default |
| guides/what-psi-pressure-washer-do-you-need.html | None | Shared theme default |
| guides/what-size-air-compressor-do-you-need.html | None | Shared theme default |
| guides/what-size-shop-vac-do-you-need.html | None | Shared theme default |
| guides/will-my-hose-feed-a-pressure-washer.html | None | Shared theme default |
| index.html | assets/garage/workshop-1800.webp, assets/garage/workshop-640.webp, assets/garage/yard-640.webp, assets/garage/pool-640.webp, assets/garage/cooking-640.webp, assets/garage/weekend-640.webp, assets/garage/pressure-640.webp, assets/garage/generator-640.webp, assets/beatbot-a200-pro-owner-photo.webp, assets/milwaukee-2656-20-owner-side.webp, assets/garage/weekend-640.webp | Shared theme default |
| pool.html | assets/garage/pool-640.webp, assets/beatbot-a200-pro-owner-photo.webp, assets/garage/pool-640.webp, assets/garage/pool-640.webp, assets/garage/pool-640.webp | assets/garage/pool-1200.webp |
| privacy.html | None | Shared theme default |
| terms.html | None | Shared theme default |
| weekend.html | assets/garage/weekend-640.webp, assets/garage/weekend-640.webp, assets/garage/weekend-640.webp, assets/garage/weekend-640.webp, assets/garage/weekend-640.webp, assets/garage/weekend-640.webp, assets/garage/weekend-640.webp, assets/garage/weekend-640.webp, assets/garage/weekend-640.webp, assets/garage/weekend-640.webp, assets/garage/weekend-640.webp | assets/garage/weekend-1200.webp |
| yard.html | assets/garage/pressure-640.webp, assets/garage/yard-640.webp, assets/garage/pressure-640.webp, assets/garage/generator-640.webp, assets/garage/pressure-640.webp, assets/garage/pressure-640.webp, assets/garage/pressure-640.webp, assets/garage/generator-640.webp | assets/garage/yard-1200.webp |

## Next acceptance steps

Resolve cards to their article targets. Source distinct photos for every duplicated article subject, keep a source/license record, optimize responsive WebP crops, use accurate alt text, and verify all affected desktop/mobile pages. Preserve owner Beatbot and Milwaukee imagery where relevant. Do not claim audit inventory is a before/after implementation map. Present actual before/after map and licensing for deployment review only after replacements are complete.

## Resumed growth analysis

Live analytics retrieved October 11 15:26 UTC for September 27–October 10: 74 active users, 85 sessions, 231 views; 76 sessions direct, 6 organic-search sessions. Search Console 266 impressions, 1 click, weighted position 57.52; last returned search day October 9. October 8 has 76 views from 2 active users; traffic/testing contamination unresolved. Raw affiliate clicks 1, external attribution unknown. Previous comparison September 13–26 includes prelaunch days and is not a clean growth baseline. Avoid claims that redesign caused gains. Prioritize existing search-visible articles and measured acquisition work after image refinement; gather fuller page/query rows before edits.
