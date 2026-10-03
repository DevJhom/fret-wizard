# CLAUDE.md

## Project Overview

**FretWizard** is an interactive web-based guitar fretboard visualization tool built with Vue 3, TypeScript, and Vite. It enables musicians to explore scales, chords, patterns (including CAGED system), and transpose them across different keys and tonalities.

**Key Goals:**
- Simplify learning music theory through interactive visualization
- Provide responsive fretboard rendering across devices
- Maintain persistence of user customizations (theme, visible strings, layout)

**Demo:** https://devjhom.github.io/fret-wizard/

**Tech Stack:** Vue 3, TypeScript, Vite 5, Pinia, Bootstrap 5, SCSS, SortableJS, Vitest, GitHub Pages; backend: `../fretWizard-service` (Express + Prisma + SQL Server)

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server (hot reload enabled) |
| `npm run build` | TypeScript type check with `vue-tsc` + Vite production build (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm test` | Vitest unit tests (`tests/unit/`) |
| `npm run deploy` | Deploy to GitHub Pages (`/fret-wizard/` base path) |

The app works without a backend: guests save everything to `localStorage`. Accounts need the backend running on `VITE_API_BASE_URL` (`.env.development`: `http://localhost:3000`; start it with `npm start` in `../fretWizard-service`). With `VITE_API_BASE_URL` unset (production builds today) every account feature is hidden.

## Architecture & Component Structure

### Component Hierarchy
```
DefaultLayout.vue (theme toggle, orientation detection, Scale | Chord | Chord Progression | Library nav)
├── FretboardPage.vue (Scale and Chord pages via `setup` prop; no sidebar; state is the fretboard stack itself)
│   ├── StackBar.vue (stack chips: select, add, reorder, remove; Reset, Save to Library)
│   ├── PatternSummary.vue (title, subtitle, tone chips that show/hide degrees)
│   ├── PatternBuilder.vue (Root + ♯/♭, Quality, Type/Scale)
│   └── MyFretboard.vue (shape fading, string toggles, note/interval labels, optional fingering + barre)
│       └── MyString.vue (renders individual strings)
├── ChordProgressionPage.vue (diatonic chord palette per key; drag/click chords into a progression)
│   └── ChordBlock.vue (numeral + chord name block)
└── LibraryPage.vue (saved fretboard stacks; opening a card loads it into its Scale/Chord page)
```

The current page lives in the URL path (`/fret-wizard/scale`, `/chord`, `/chord-progression`, `/library`; `src/lib/pageRoute.ts`, `history.pushState`), so a refresh reopens it and Back/Forward switch pages; there is no vue-router. GitHub Pages has no server routing, so the `spa-fallback` plugin in `vite.config.ts` copies `index.html` to `404.html` on build: a refresh loads the app with HTTP status 404, which is expected. Scale and Chord pages persist separate fretboard stacks (`scaleCurrentFretboard`/`scaleFretboardList`, `chordCurrentFretboard`/`chordFretboardList`). Legacy `currentFretboard`/`fretboardList` keys are migrated on first read in `localStorageAdapter.ts`. A `LibraryCard` stores `setup` plus a `fretboards` stack; the active card auto-updates when leaving its page. A Shape is one `currentCAGED` entry set to true (all true = All); tones outside it fade. Chord shapes are named from the chord root; Scale shapes keep the tonality-based offset (relative major for minor keys). The Chord page also has a Fingering view (`chordView: 'fingering'`, position in `currentChordPosition`) using `chords.ts` triad fingerings, adapted for minor, for Triad and Power only. The Chord Progression page persists `{ key, tonality, progression: { id, degree, type }[] }` under `chordProgression`; storing degrees means the progression transposes with the key. `type` is the chord type (`'triad' | 'seventh' | 'power'`, `diatonicChords()` in `progressions.ts`): the Chord Type selector picks the palette, and each chord keeps the type it was added with. A missing `type` (older saves) means triad.

### Service Layer
- **`customizerService.ts`** — the one entry point for persistence. Signed-in users go through `adapters/apiAdapter.ts`, guests through `adapters/localStorageAdapter.ts`; the theme always stays local. Library writes are per card (`createLibraryCard`, `updateLibraryCard`, `deleteLibraryCard`).
- **`adapters/apiAdapter.ts`** — debounces workspace and chord-progression saves (800 ms); `flushPendingSaves()` sends them immediately. After a failed load (not a 404) it skips saves for that page, so fallback defaults never overwrite the account.
- **`http.ts`** — `apiRequest` + `ApiError`; on a 401 it refreshes once and retries.
- **`session.ts`** — access token in memory, refresh token in `localStorage` (`refreshToken`); refreshes are serialised across tabs with `navigator.locks` and re-read the token inside the lock.
- **`guestData.ts`** — collects browser data for `POST /me/import` and clears it after a successful import.
- **`authApi.ts`, `authErrors.ts`, `googleIdentity.ts`** — auth endpoints, form error messages, Google button.

### Data Layer (Music Theory)
Located in `src/components/data/`:
- **`constants.ts`** — Enums (Pattern, Tonality, Setup, Accidental, Degree), note arrays for all key/tonality/accidental combos, degree-to-pattern lookup tables, key-to-number mappings
- **`intervals.ts`** — Fret positions for each interval/degree on each string, accounts for 3 octaves per string. Functions: `getRoots()`, `getSeconds()`, `getThirds()`, etc.
- **`noteNames.ts`** — Note naming and enharmonic equivalents (C♯ vs D♭). Functions: `getNoteName()`, `findRelativeMajor()`, `findRelativeMinor()`
- **`CAGED.ts`** — CAGED system shape definitions with pre-defined fret ranges. Functions: `isCAGED()` checks if fret matches active shapes
- **`patternNames.ts`** — Titles, subtitles and stack-chip labels for chords and scales (`patternTitle()`, `patternSubtitle()`, `patternSymbol()`), degree labels (`degreeLabel()`), `isQualityLocked()` for Dominant/Power/Chromatic
- **`chords.ts`** — Triad fingerings (C, A, G shapes) and barre positions for the Chord page's Fingering view. Functions: `getChordPositions()` (minor-aware), `getBarPositions()`, `fingeringAvailable()`
- **`progressions.ts`** — Diatonic chords per key with correct letter spelling. Functions: `progressionKeys()`, `diatonicChords()`, `relativeProgressionKey()`

### State
- **`src/lib/fretboardData.ts`** — `FretboardData` (one fretboard: key, tonality, pattern, accidental, visible tones, CAGED, strings, frets, chord position/view) plus `defaultDataFor(setup)`
- **`FretboardPage.vue`** owns its stack (`FretboardData[]`) and saves it to storage on every change; there is no global pattern store
- **`src/stores/useLibraryStore.ts`** — Library cards and the active card
- **`src/stores/useAuthStore.ts`** — session status (`restoring` / `guest` / `authenticated`), the user, and `sessionVersion`. DefaultLayout keys the pages on `sessionVersion` so they remount and reload when the session changes; the status turns `authenticated` only after guest data has been imported.

## Key Files & Their Purposes

| File | Purpose |
|------|---------|
| `src/main.ts` | Vue app initialization, Pinia setup (library store) |
| `src/App.vue` | Root component, imports DefaultLayout |
| `vite.config.ts` | Path aliases, GitHub Pages base path (`/fret-wizard/`), SCSS auto-import, Vite plugins |
| `tsconfig.json` | CompilerOptions for path aliases and Vue 3 |
| `database/all-scales.json` | Central music theory database (served by json-server) |
| `src/assets/scss/variables.scss` | Global color, spacing, font variables (interval-specific colors) |
| `src/assets/scss/main.scss` | Root styles, dark/light theme definitions |

## Conventions & Patterns

### Path Aliases
Configured in `vite.config.ts` and `tsconfig.json`. **Always use aliases in imports:**
- `@/` → `src/`
- `@components/` → `src/components/`
- `@data/` → `src/components/data/`
- `@stores/` → `src/stores/`
- `@services/` → `src/services/`
- `@assets/` → `src/assets/`
- `@scss/` → `src/assets/scss/`
- `@images/` → `src/assets/images/`

✅ `import { MAJOR_SCALE } from '@data/intervals'`
❌ `import { MAJOR_SCALE } from '../../components/data/intervals'`

### Composition API & `<script setup>`
All components use Vue 3 Composition API with `<script setup lang="ts">` syntax. **Do not use Options API.**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)
</script>
```

### Global SCSS
Variables from `src/assets/scss/variables.scss` are **auto-imported** in all components via Vite configuration. **No explicit `@import` needed** in component `<style>` blocks.

### Styling
- Use `<style scoped lang="scss">` in components
- Bootstrap utility classes combined with custom SCSS
- BEM-like selectors for custom elements
- Color palette: Dark theme (blacks, grays, bright accents) and light theme (light grays, darker text)
- Interval-specific colors defined in `variables.scss` (reds, oranges, greens, cyans, blues)

### Naming Conventions
- **Components:** PascalCase (`FretboardPage.vue`, `MyFretboard.vue`)
- **Functions:** camelCase (`getBasePattern()`, `updateTonality()`)
- **Variables/Constants:** camelCase for variables, UPPER_CASE for true constants
- **Store actions:** action verbs (`createCard()`, `updateCardFretboards()`)
- **Props:** typed via `defineProps<T>()`

### Responsive Design
- One shared breakpoint, `$phone` (940px) in `variables.scss`, for phones in either orientation: `@media (max-width: $phone)`
- Portrait works everywhere. On Scale/Chord pages the neck scrolls sideways inside `.board-scroll`, and a portrait-only hint at the top of the page suggests rotating
- On phones the page nav (`.nav-tabs`) becomes a left sidebar opened by the menu button in the top bar (`isMenuOpen` in `DefaultLayout.vue`); picking a page, the backdrop or Esc closes it
- Test both orientations during development

### Persistence Strategy
- **Guests** → `localStorage` (Library cards, Scale/Chord stacks, Chord Progression, theme), exactly as before accounts existed.
- **Signed-in users** → the backend (`/library-cards`, `/workspaces/:setup`, `/chord-progression`); theme stays in `localStorage`.
- **First login in a browser** → guest data is imported (`POST /me/import`): cards are appended; stacks and the progression only fill empty slots. On success the guest keys are cleared.

### Drag-and-Drop
SortableJS is used for reordering multiple fretboards. When modifying fretboard list handling, ensure `MyFretboard` components maintain stable `key` bindings in `v-for` loops.

### Music Theory Implementation
- Key transposition via array rotation (shifting notes based on key number)
- Base patterns are built on C for both major and minor, then shifted by `majorKeyToNumber` (`getScale()`)
- 6 strings (E, A, D, G, B, e) with standard tuning, up to 24 frets
- Fret indicators at positions 3, 5, 7, 9, 12, 15, 17, 19, 21, 24
- Notes rendered as colored dots based on interval type
- Accidental support for both sharp (♯) and flat (♭) notation

## Common Development Patterns

### Adding a New Pattern Type
1. Define the pattern in `src/components/data/intervals.ts` or `chords.ts`
2. Add enum value in `constants.ts` if needed
3. Update the music database `database/all-scales.json`
4. Add it to the type/scale list in `PatternBuilder.vue` and its names in `patternNames.ts`
5. Check it renders on `FretboardPage.vue` for the right setup
6. Test with both single and multiple fretboards

### Customizing the Fretboard
1. Edit fretboard rendering in `MyFretboard.vue` (DOM structure)
2. Style with component `<style scoped>` or relevant SCSS files
3. Update `customizerService` if persisting new settings

### Working with the Library Store
```typescript
import { useLibraryStore } from '@stores/useLibraryStore'

const libraryStore = useLibraryStore()
await libraryStore.ensureLoaded()
await libraryStore.createCard('Card 1', Setup.Chord, fretboards)
```

## Potential Pitfalls

1. **Backend not running** — with `VITE_API_BASE_URL` set but the backend down, guests are unaffected, sign-in shows "Something went wrong", and a saved session stays logged out for that page load (the refresh token is kept for the next one).

2. **Breaking TypeScript checks** — `npm run build` includes `vue-tsc` which is strict. Ensure all `.ts` and `.vue` files have proper type annotations.

3. **Path aliases not working** — If imports fail, verify both `vite.config.ts` and `tsconfig.json` are in sync.

4. **LocalStorage pollution** — The `customizerService` uses hardcoded keys. Changing key names breaks backward compatibility. Add migration logic if renaming.

5. **Fretboard re-rendering** — Vue's reactivity requires proper key binding in `v-for` loops. SortableJS modifications need stable component IDs.

6. **GitHub Pages base path** — The app is deployed to `/fret-wizard/`, not root. Relative asset paths must account for this. Vite config already handles this.

7. **Data layer separation** — Keep music theory logic in `src/components/data/`. Don't mix interval/chord calculations with UI rendering code.

## Guidelines for AI Assistance

- Always run `npm run build` before assuming changes work (catches TypeScript errors)
- Use path aliases consistently — never relative paths
- Test responsiveness — check portrait mode alongside landscape
- Update LocalStorage keys carefully — breaking changes affect existing users
- Preserve the data layer abstraction — music theory logic stays in `src/components/data/`
- When adding new patterns/chords, follow the full flow: data definition → constants → store → sidebar → fretboard
- Multiple fretboards can exist simultaneously — test changes with both single and multiple fretboards
