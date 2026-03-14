# Warmaster Roster

## Project Overview
A web-based army roster builder for **Warmaster Revolution (WMR v2.24)** — a tabletop wargaming system. Players can build, manage, customize, and share army lists with full point calculations, unit constraints, and magic item management. Supports 25+ factions. Deploys via GitHub → Vercel.

## Tech Stack
- **Frontend:** React 18 (functional components, hooks)
- **Build:** Vite 5
- **Backend:** Supabase (auth + PostgreSQL via custom lightweight REST client, no SDK)
- **Styling:** Inline styles with faction-specific theming (three color modes)
- **Fonts:** Cinzel (headings), Crimson Text (body)
- **Deployment:** Vercel (auto-deploy on push to main)

## Startup
- At the start of every conversation, run `git pull` before doing anything else.
- After completing work, commit and push to main.

## Commands
```bash
npm install        # Install dependencies
npm run dev        # Start dev server (Vite HMR)
npm run build      # Production build → dist/
npm run preview    # Preview production build
```

## Architecture
- **Monolithic SPA:** All application code lives in `src/App.jsx` (~3,700 lines)
- **No routing library** — state-based screen navigation
- **No state management library** — React useState throughout
- **No CSS files** — all inline styles with army color theming
- **IMAGES constant** — hardcoded Midjourney CDN URLs for unit/spell/magic item art

## Code Organization (App.jsx)
1. Supabase client setup & auth helpers (~lines 1-99)
2. Magic items constants: `MAGIC_STANDARDS`, `MAGIC_WEAPONS`, `DEVICES_OF_POWER` (~lines 100-130)
3. `IMAGES` constant — CDN URLs for factionBorders, units, spells, magicItems (~lines 136-360)
4. `ARMIES` data object — all 25 factions with units, spells, rules, lore (~lines 360-1227)
5. Helper functions, color variable block, blendHex() (~lines 1228+)
6. Card components: CardShell, PrintCard, MountCard, SpellCard, SpecialRuleCard, MagicItemCard, CardBack
7. PrintView component with backMode state and three print layouts
8. Main `App` component at bottom

## Conventions
- **Variables/functions:** camelCase
- **Constants:** UPPER_SNAKE_CASE (`ARMIES`, `MAGIC_STANDARDS`, `IMAGES`)
- **Components:** PascalCase, defined inline within App.jsx
- **Event handlers:** `handle` prefix (`handleAuth`, `handleAddUnit`)
- **Section separators:** `──` comment style for major sections
- **Conditional JSX:** Always use ternary (`cond ? <X/> : null`), NEVER `&&` — esbuild misparses it
- **No TypeScript** — plain JavaScript/JSX

## Card System
- **Card size:** 63mm × auto-height (min ~57mm inner), standard poker card target (63×88mm)
- **Five card types:** Unit, Mount, Spell, Special Rule, Magic Item
- **Three color modes:** `print` (default, parchment), `faction` (dark), `cardcolor` (mid-tone)
- **Three print modes:** Fronts Only, + Backs (2 sheets for duplex), + Backs (side by side)
- **CardBack:** Pure CSS, universal for all types, no images needed
- **Magic items:** Own neutral gold/parchment color scheme (cross-faction)
- **Images:** referrerPolicy="no-referrer" on all `<img>` tags (Midjourney CDN hotlink fix)

## Image Key Naming
- **Units:** `{faction_prefix}_{camelCaseUnitName}` — e.g. `emp_warAltar`, `vc_etherealHost`
- **Spells:** `{army_slug}_{spell_name_no_apostrophes}` — e.g. `vampire_counts_vanhels_danse_macabre`
- **Magic items:** descriptive snake_case — e.g. `banner_shielding_sup`, `crown_command`

## Game Data Structure
Each army in the `ARMIES` object contains:
- `name`, `color`, `bg`, `accent` — identity and theming
- `armyRules` — array of `{ name, description }` rule objects
- `spells` — array of spell definitions
- `units` — array of unit objects with stats (`atk`, `hits`, `armour`, `cmd`), `pts`, `size`, `min`, `max`, `type`, `special`
- `playstyle`, `lore`, `fluff`, `traits`, `strengths`, `weaknesses`

## Key Features
- Roster building with add/remove/reorder units
- Real-time point calculation and validation
- Magic item assignment with eligibility rules
- Character mount system
- Share rosters via base64-encoded URLs
- Save/load rosters to Supabase
- Card generation and print view (three back modes)
- Mobile-responsive layout

## Important Notes
- Supabase credentials are publishable keys (safe for client-side)
- No test framework configured
- All commits go directly to `main`
- `node_modules` and `dist/` are not committed
- Always verify local App.jsx matches repo before pushing (local drift risk)
