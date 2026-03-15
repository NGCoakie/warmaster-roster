# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Startup
At the start of every session, run `git pull origin dev` before doing anything else to avoid drift.

## Commands

```bash
npm run dev      # Start dev server → localhost:5173 (Vite HMR)
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
```

No environment variables required — Supabase credentials are hardcoded as the public anon key directly in `src/App.jsx`.

## Deployment
Auto-deploys to **Vercel** on push to `main`. Work on `dev` branch day-to-day; merge to `main` only for releases.

## Branch Strategy
- `main` — stable, auto-deploys to Vercel
- `dev` — active integration branch (default working branch)
- `feature/*` — short-lived feature branches off `dev`
- `hotfix/*` — urgent fixes off `main`, merged back to both `main` and `dev`

## Architecture

**Warmaster Revolution Army Roster Builder** is a single-page React 18 app built with Vite. The entire application lives in one file: `src/App.jsx` (~4100+ lines). There is no routing library — screen state is managed with `useState`. **Do not split this file.**

### Screen Flow
`AuthScreen` → `FactionSelector` → `ArmyConfirm` → Builder (`UnitList` + `UnitDetail` + `RosterPanel`) → `PrintView`

Other screens: `SavedLists`, `HowToPlay`, `MagicItemsPrintView`

### Code Organisation (App.jsx — approximate line ranges)
1. Icon SVG set (`Icon` object)
2. Supabase client (`sb` object), auth helpers, session storage
3. Magic items constants: `MAGIC_STANDARDS`, `MAGIC_WEAPONS`, `DEVICES_OF_POWER`
4. `IMAGES` constant — CDN URLs for factionBorders, units, spells, magicItems
5. `ARMIES` data — all 25 factions with units, spells, rules, lore (WMR v2.24)
6. Helper functions, colour variables, `blendHex()`
7. Card components: `CardShell`, `PrintCard`, `MountCard`, `SpellCard`, `SpecialRuleCard`, `MagicItemCard`, `CardBack`
8. `PrintView` component
9. Main `App` component (root state, screen routing)

### Key Components (all in `src/App.jsx`)
- **`App`** — root; owns all screen/session/roster state
- **`AuthScreen`** — sign up / sign in / guest login via Supabase Auth
- **`FactionSelector`** — grid of 25 factions to choose from
- **`ArmyConfirm`** — shows army rules and spell list before entering builder
- **`UnitList`** — left panel; lists all units for the selected army with min/max enforcement
- **`UnitDetail`** — middle panel; unit stats, upgrades, and magic item selection
- **`RosterPanel`** — right panel; current roster, point totals, drag-to-reorder, validation warnings
- **`PrintView`** — printable card sheets; renders `PrintCard`, `MountCard`, `MagicItemCard`, `SpellCard`, `SpecialRuleCard`, `CardBack`

### Data (all hardcoded in `src/App.jsx`)
- **`ARMIES`** — complete army data for all 25 factions (units, stats, army rules, spells, mounts). Source: WMR Armies v2.24.
- **`MAGIC_STANDARDS`**, **`MAGIC_WEAPONS`**, **`DEVICES_OF_POWER`** — magic item pools with eligibility rules
- **`IMAGES`** — Midjourney CDN URLs for unit art and faction borders; missing URLs fall back to a placeholder icon
- **`FLAVOR_TEXT`** — per-faction lore blurbs shown on the Army Confirm screen

### Supabase
- Lightweight REST client (`sb` object) — no npm package, raw `fetch` calls
- URL and anon key hardcoded in `src/App.jsx` (public key, intentional)
- Auth: `signUp`, `signIn`, `signOut`, `getUser`
- Data: `army_lists` table — `getLists`, `saveList`, `deleteList`
- Session stored in `localStorage` as `wmr_session`

### Validation & Rules
- `validateRoster(roster, army, totalPts)` — checks min/max unit counts per 1000pt bracket
- `effectiveMin` / `effectiveMax` — scale min/max requirements with army size
- `getMagicItemsForUnit(unit)` — filters magic items by unit type (character type, armour value, etc.)
- `getBannerEligibility(unit)` — enforces banner-carrying restrictions

### Styling
- No CSS framework — all styles are inline JS objects
- Print layout uses `@media print` with fixed card dimensions (63.5×88.9mm)
- Mobile breakpoint: 768px via `useIsMobile()` hook

### Card System
- **Card size:** 63.5 × 88.9mm (standard poker card)
- **Image area:** 59.5 × 35mm (after 2mm padding) → Midjourney aspect ratio `--ar 17:10`
- **Five card types:** Unit, Mount, Spell, Special Rule, Magic Item
- **Three colour modes:** `print` (parchment), `preview` (dark), `white` (white-bg preview)
- **Three print modes:** Fronts Only, + Backs (duplex 2-sheet), + Backs (side-by-side)
- `referrerPolicy="no-referrer"` on all `<img>` tags (Midjourney CDN hotlink fix)

### Icons
- `Icon` object at the top of the file — tiny inline SVG components for combat keywords (terror, frenzy, fly, shoot, etc.)
- Used in `PrintCard` badge strips to render keyword icons on unit cards

### Sharing
- `ShareModal` builds a shareable URL by base64-encoding the roster as a query param
- Shared URLs are loaded on app init and bypass the auth gate

### Image Key Naming
- **Units:** `{faction_prefix}_{camelCaseUnitName}` — e.g. `emp_warAltar`, `vc_etherealHost`
- **Spells:** `{army_slug}_{spell_name_no_apostrophes}` — e.g. `vampire_counts_vanhels_danse_macabre`
- **Magic items:** descriptive snake_case — e.g. `banner_shielding_sup`, `crown_command`

## Conventions
- **Variables/functions:** camelCase
- **Constants:** UPPER_SNAKE_CASE (`ARMIES`, `MAGIC_STANDARDS`, `IMAGES`)
- **Components:** PascalCase, defined inline within App.jsx
- **Event handlers:** `handle` prefix (`handleAuth`, `handleAddUnit`)
- **Section separators:** `── SECTION NAME ──` comment style for major blocks
- **Conditional JSX:** Always use ternary (`cond ? <X/> : null`), **NEVER `&&`** — esbuild misparses falsy values (`0 && <X/>` renders `0`)
- **No TypeScript** — plain JavaScript/JSX

## Art Spreadsheet
`warmaster_midjourney_prompts.xlsx` (project root) — Midjourney prompt reference for 477 images (92 spells, 362 units/mounts, 23 magic items). Standard MJ params: `--ar 17:10 --sref 1892146708 --v 6.1`. Manipulate with PowerShell COM — npm/xlsx not available.
