# CLAUDE.md

## Project Overview

**FretWizard** is an interactive web-based guitar fretboard visualization tool built with Vue 3, TypeScript, and Vite. It enables musicians to explore scales, chords, patterns (including CAGED system), and transpose them across different keys and tonalities.

**Key Goals:**
- Simplify learning music theory through interactive visualization
- Provide responsive fretboard rendering across devices
- Maintain persistence of user customizations (theme, visible strings, layout)

**Demo:** https://devjhom.github.io/fret-wizard/

**Tech Stack:** Vue 3, TypeScript, Vite 5, Pinia, Bootstrap 5, SCSS, SortableJS, Vitest, GitHub Pages; backend: `../fretWizard-service` (Express + Prisma + PostgreSQL)

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
│   ├── StackBar.vue (stack chips: select, add, remove, reorder; the Default View / Stack View button; Save)
│   │   └── SaveMenu.vue (split button: "Save to Library" / "Saved", with "Save as a New Card" behind the arrow)
│   ├── FretboardEditor.vue (the editor card: actions, summary, a `builder` slot, neck + toolbar, chord diagrams; emits patches; also used by the Chord Progression page)
│   ├── StackRow.vue (Stack View: one collapsed fretboard: drag handle, name, neck, Edit, Remove)
│   ├── PatternSummary.vue (title, subtitle, tone chips that show/hide degrees)
│   ├── PatternBuilder.vue (Root + ♯/♭, Quality, Chord/Scale)
│   ├── PatternBoard.vue (one `FretboardData` drawn as a neck; used by the editor and by StackRow)
│   │   └── MyFretboard.vue (shape fading, string toggles, note/interval labels)
│   │       └── MyString.vue (renders individual strings)
│   └── VerticalChord.vue (Chord page: one position as a vertical chord diagram, in SVG with the neck's sizes and colors; the editor card shows every position under the neck)
├── ChordProgressionPage.vue (diatonic chord palette per key; drag/click chords into a progression)
│   └── ChordBlock.vue (numeral + chord name block)
└── LibraryPage.vue (saved fretboard stacks: search, Scales/Chords filter, Favorites toggle, sort; opening a card loads it into its Scale/Chord page)
    ├── LibraryCardItem.vue (badge, rename, delete confirm, one chip per fretboard, favorite heart in the footer)
    │   └── FretboardPreview.vue (frets 0–12 from `boardPreview()` in `@data/boardPreview`)
    └── NewCardModal.vue ("New Card": pick Scale/Chord and a title before the card is created)
```

The current page lives in the URL path (`/fret-wizard/scale`, `/chord`, `/chord-progression`, `/library`; `src/lib/pageRoute.ts`, `history.pushState`), so a refresh reopens it and Back/Forward switch pages; there is no vue-router. A Scale/Chord page opened from a Library card carries the card id (`/fret-wizard/scale/<card-id>`). `src/lib/cardSession.ts` remembers per page (localStorage `scaleWorkspaceCardId` / `chordWorkspaceCardId`) which card the stack came from, so a refresh keeps unsaved edits and the Scale/Chord tabs return to that card. Scale/Chord pages have two views: the Default view (tabs plus the selected fretboard's editor card) and Stack View, which lists every fretboard of the stack collapsed to its name and neck (`StackRow`). One button in the bar switches between them and is labelled with the view it switches to ("Stack View" / "Default View"), so it is never shown as pressed. In Stack View, Edit opens the editor card in place of that row and Done collapses it again (`isEditing` in `FretboardPage.vue`, not persisted); each row also has Remove, and rows are reordered by dragging their handle. A fretboard is removed with the × on its tab, the trash button next to Reset on the editor card, or the trash button on its Stack View row; none of them shows when the stack has one fretboard. Both views render through one list with a slot per fretboard: the Default view fills only the selected slot. `src/lib/stackView.ts` remembers the view per page in this browser only (localStorage `scaleStackView` / `chordStackView`). GitHub Pages has no server routing, so the `spa-fallback` plugin in `vite.config.ts` copies `index.html` to `404.html` on build: a refresh loads the app with HTTP status 404, which is expected. Scale and Chord pages persist separate fretboard stacks (`scaleCurrentFretboard`/`scaleFretboardList`, `chordCurrentFretboard`/`chordFretboardList`). Legacy `currentFretboard`/`fretboardList` keys are migrated on first read in `localStorageAdapter.ts`. A `LibraryCard` stores `setup` plus a `fretboards` stack, and `isFavorite` (toggled by the heart on its Library card; missing on older guest saves means false). A card changes only when "Save to Library" is pressed on its page; "Save as a New Card" in the same button's menu forks it. The bar does not name the open card (the Save button's tooltip does) and has no way to close it: the page stays on its card until another card is opened or the card is deleted. Opening another card over unsaved edits asks first. A Shape is one `currentCAGED` entry set to true (all true = All); tones outside it fade. Chord shapes are named from the chord root; Scale shapes keep the tonality-based offset (relative major for minor keys). Below the neck, in a section of its own, the Chord page's editor card shows every position of the chord side by side as vertical chord diagrams (`VerticalChord`, from `chordVoicings()` in `chords.ts`: up to five CAGED shapes per chord type and tonality, each an open chord moved to the root; a scale pattern shows a note instead). The diagrams follow the tone chips, the string toggles and the Notes/Intervals labels; Stack View rows show the neck only. Each diagram is a radio tile bound to the same `currentCAGED` as the Shape buttons, so picking one shows its CAGED shape on the neck (and "All" in the toolbar clears it). They replaced the old Position view, so `chordView` and `currentChordPosition` are no longer read, but stay on `FretboardData` because saves and the backend's validation still carry them. The Chord Progression page persists `{ key, tonality, progression: { id, degree, type }[] }` under `chordProgression`; storing degrees means the progression transposes with the key. `type` is the chord type (`'triad' | 'seventh' | 'power'`, `diatonicChords()` in `progressions.ts`): the Chord selector picks the palette, and each chord keeps the type it was added with. A missing `type` (older saves) means triad. Below the progression, every chord of it shows as a Stack View row (`StackRow`). Rows drag by their handle like the Chord page's, and the box and the stack share one order (`moveChord`), so dragging in either reorders both. Edit opens `FretboardEditor` without a builder: the chord comes from the progression, so only tones, Shape, strings and frets change. Those are saved per chord as `view` (`ProgressionChordView`, `src/lib/progressionStack.ts`), with tones stored as hidden ones so a chord whose quality changes with the key still shows its new tones. The backend does not store `type` or `view` yet (it keeps only `degree`), so signed-in users get triads with default views after a reload. `diatonicChordPattern()` maps each chord to the Chord page pattern and quality (vii° → Diminished, V7 → Dominant, m7♭5 → HalfDiminished); a root the neck has no key name for (E♯, C♭) takes its other name, so F♯ major's E♯m7♭5 row reads Fm7♭5.

### Service Layer
- **`customizerService.ts`** — the one entry point for persistence. Signed-in users go through `adapters/apiAdapter.ts`, guests through `adapters/localStorageAdapter.ts`; the theme always stays local. Library writes are per card (`createLibraryCard`, `updateLibraryCard`, `deleteLibraryCard`).
- **`adapters/apiAdapter.ts`** — debounces workspace and chord-progression saves (800 ms); `flushPendingSaves()` sends them immediately. After a failed load (not a 404) it skips saves for that page, so fallback defaults never overwrite the account.
- **`http.ts`** — `apiRequest` + `ApiError`; on a 401 it refreshes once and retries.
- **`session.ts`** — access token in memory, refresh token in `localStorage` (`refreshToken`); refreshes are serialised across tabs with `navigator.locks` and re-read the token inside the lock.
- **`guestData.ts`** — collects browser data for `POST /me/import` and clears it after a successful import.
- **`authApi.ts`, `authErrors.ts`, `googleIdentity.ts`** — auth endpoints, form error messages, Google button.

### Data Layer (Music Theory)
Located in `src/lib/music-theory/` (alias `@data`):
- **`constants.ts`** — Enums (Pattern, Tonality, Setup, Accidental, Degree), note arrays for all key/tonality/accidental combos, degree-to-pattern lookup tables, key-to-number mappings
- **`intervals.ts`** — Fret positions for each interval/degree on each string, accounts for 3 octaves per string. Functions: `getRoots()`, `getSeconds()`, `getThirds()`, etc.
- **`noteNames.ts`** — Note spelling from the root and the interval (`spellInterval()`: a third is always two letters up, so C minor's ♭3 is E♭, not D♯). `getNoteName()` spells every pattern from its key; the blues ♭5 becomes a ♯4 where it would need a double flat (A in E♭ minor), and Chromatic uses sharps from a natural or sharp root, flats from a flat one. `keyRoots()` / `rootName()` name the black-key roots by pattern and quality (major-sounding D♭ E♭ F♯ A♭ B♭, minor C♯ E♭ F♯ G♯ B♭, Dim and m7♭5 all sharps), so no scale or chord needs a double sharp or flat. Also `findRelativeMajor()`, `findRelativeMinor()`
- **`CAGED.ts`** — CAGED system shape definitions, written in C and repeating every 12 frets: each shape is a 4-fret block on every string, plus a few of its notes a fret outside it (and, for add9 only, the A and E shapes' 9th two frets out). Functions: `isInCAGEDBlock()` for the highlighted band, `isCAGED()` for whether a note is in the active shapes (block or just outside; notes outside fade)
- **`patternNames.ts`** — Titles, subtitles and stack-chip labels for chords and scales (`patternTitle()`, `patternSubtitle()`, `patternSymbol()`), degree labels (`degreeLabel()`), `isQualityLocked()` for the patterns Major/Minor doesn't change (Dominant, Power, Chromatic, Sus2, Sus4, Diminished, Half-Diminished)
- **`chords.ts`** — Chord shapes for the Chord page's chord diagrams, written in C as tabs per chord type and tonality. Functions: `chordVoicings()` (one playable voicing per shape for a `FretboardData`: frets placed in the lowest 5-fret window, muting hidden tones and strings, with its barre and first fret), `fingeringAvailable()`
- **`progressions.ts`** — Diatonic chords per key, spelled with `spellInterval()`. Functions: `progressionKeys()`, `diatonicChords()`, `relativeProgressionKey()`, `diatonicChordPattern()`
- **`boardPreview.ts`** — Lit degree per string for frets 0–12 of one fretboard (visible tones and strings only). Used by the Library card preview

### State
- **`src/lib/fretboardData.ts`** — `FretboardData` (one fretboard: key, tonality, pattern, accidental, visible tones, CAGED, strings, frets, and the unused chord position/view) plus `defaultDataFor(setup)`
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
| `src/assets/scss/variables.scss` | Global color, spacing, font variables (interval-specific colors) |
| `src/assets/scss/main.scss` | Root styles, dark/light theme definitions |

## Conventions & Patterns

### Path Aliases
Configured in `vite.config.ts` and `tsconfig.json`. **Always use aliases in imports:**
- `@/` → `src/`
- `@components/` → `src/components/`
- `@data/` → `src/lib/music-theory/`
- `@stores/` → `src/stores/`
- `@services/` → `src/services/`
- `@assets/` → `src/assets/`
- `@scss/` → `src/assets/scss/`
- `@images/` → `src/assets/images/`

✅ `import { MAJOR_SCALE } from '@data/intervals'`
❌ `import { MAJOR_SCALE } from '../../lib/music-theory/intervals'`

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
- **Always this browser only** → theme, the open card per page (`scaleWorkspaceCardId` / `chordWorkspaceCardId`) and Stack View per page (`scaleStackView` / `chordStackView`).
- **First login in a browser** → guest data is imported (`POST /me/import`): cards are appended; stacks and the progression only fill empty slots. On success the guest keys are cleared.

### Drag-and-Drop
SortableJS is used for reordering multiple fretboards: the tabs in `StackBar.vue` and the Stack View rows in `FretboardPage.vue` (dragged by `.drag-handle`; the open editor card has none, so its sliders and buttons never start a drag). Both put the dragged DOM node back (`restoreElementPosition`) and reorder the data instead, so Vue stays in charge of the DOM. When modifying fretboard list handling, ensure `MyFretboard` components maintain stable `key` bindings in `v-for` loops.

### Music Theory Implementation
- Key transposition via array rotation (shifting notes based on key number)
- Base patterns are built on C for both major and minor, then shifted by `majorKeyToNumber` (`getScale()`)
- 6 strings (E, A, D, G, B, e) with standard tuning, up to 24 frets
- Fret indicators at positions 3, 5, 7, 9, 12, 15, 17, 19, 21, 24 (`FRET_MARKERS` in `src/lib/fretMarkers.ts`, shared by the neck and the chord diagrams)
- Inlay dots on the neck at the same frets (`inlayFrets` on `MyString.vue`): one between the G and D strings, two at 12 and 24 (between B and G, and D and A)
- The chord diagrams (`VerticalChord.vue`) copy the neck's design: string thicknesses, 25px string spacing, 32px frets, 3px nut, 18px notes with 12px labels, 12px open-string notes against the nut, inlays and fret numbers. Keep the two in step when the neck's look changes. `--note-ring-color` is `--note-ring` as an SVG stroke color
- Notes rendered as colored dots based on interval type
- Note names are spelled from the key (`noteNames.ts`). Neither page has a ♯/♭ toggle: each root is named by its pattern and quality (`keyRoots()`, the same key names the Chord Progression page uses), respelled on every change and when a stack or card loads. `currentAccidental` is no longer read but stays on `FretboardData` for saved data and the backend's validation. `sameStack()` compares keys by pitch, so that respelling never marks a card as unsaved

## Common Development Patterns

### Adding a New Pattern Type
1. Define the pattern in `src/lib/music-theory/intervals.ts` or `chords.ts`
2. Add enum value in `constants.ts` if needed
3. Add it to the type/scale list in `PatternBuilder.vue` and its names in `patternNames.ts`
4. Check it renders on `FretboardPage.vue` for the right setup
5. Test with both single and multiple fretboards

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

7. **Data layer separation** — Keep music theory logic in `src/lib/music-theory/`. Don't mix interval/chord calculations with UI rendering code.

## Guidelines for AI Assistance

- Always run `npm run build` before assuming changes work (catches TypeScript errors)
- Use path aliases consistently — never relative paths
- Test responsiveness — check portrait mode alongside landscape
- Update LocalStorage keys carefully — breaking changes affect existing users
- Preserve the data layer abstraction — music theory logic stays in `src/lib/music-theory/`
- When adding new patterns/chords, follow the full flow: data definition → constants → store → sidebar → fretboard
- Multiple fretboards can exist simultaneously — test changes with both single and multiple fretboards
