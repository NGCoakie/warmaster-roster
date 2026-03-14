# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:5173)
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
```

No environment variables required — Supabase credentials are hardcoded as the public anon key directly in `src/App.jsx`.

## Architecture

**Warmaster Revolution Army Roster Builder** is a single-page React 18 app built with Vite. The entire application lives in one file: `src/App.jsx` (~4000+ lines). There is no routing library — screen state is managed with `useState`.

### Screen Flow
`AuthScreen` → `FactionSelector` → `ArmyConfirm` → Builder (`UnitList` + `UnitDetail` + `RosterPanel`) → `PrintView`

Other screens: `SavedLists`, `HowToPlay`, `MagicItemsPrintView`

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
- No CSS framework — all styles are inline JS objects defined in the `GS` component and scattered throughout
- Print layout uses `@media print` with fixed card dimensions (63×88mm)
- Mobile breakpoint: 768px via `useIsMobile()` hook

### Icons
- `Icon` object at the top of the file — tiny inline SVG components for combat keywords (terror, frenzy, fly, shoot, etc.)
- Used in `PrintCard` badge strips to render keyword icons on unit cards

### Sharing
- `ShareModal` builds a shareable URL by base64-encoding the roster as a query param
- Shared URLs are loaded on app init and bypass the auth gate
